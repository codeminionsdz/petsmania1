import { getSupabaseServerClient } from "./supabase/server"
import type { Product, Category, Brand, Wilaya, PaginatedResponse, FilterOptions } from "./types"

// Helper to transform DB product to frontend Product type
function transformProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description || "",
    shortDescription: dbProduct.short_description || "",
    price: dbProduct.price,
    originalPrice: dbProduct.original_price,
    discount: dbProduct.discount,
    images: dbProduct.product_images?.map((img: any) => img.url) || [],
    categoryId: dbProduct.category_id,
    categoryName: dbProduct.categories?.name || "",
    brandId: dbProduct.brand_id,
    brandName: dbProduct.brands?.name || "",
    stock: dbProduct.stock,
    sku: dbProduct.sku,
    featured: dbProduct.featured,
    tags: dbProduct.tags || [],
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  }
}

function transformCategory(dbCategory: any, parent?: any): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    slug: dbCategory.slug,
    description: dbCategory.description || "",
    image: dbCategory.image || "",
    parentId: dbCategory.parent_id,
    parentName: parent?.name || dbCategory.parent?.name,
    parentSlug: parent?.slug || dbCategory.parent?.slug,
    productCount: dbCategory.product_count || 0,
    children: [],
  }
}

function transformBrand(dbBrand: any): Brand {
  return {
    id: dbBrand.id,
    name: dbBrand.name,
    slug: dbBrand.slug,
    description: dbBrand.description || "",
    logo: dbBrand.logo || "",
    productCount: dbBrand.product_count || 0,
    featured: dbBrand.featured,
  }
}

export async function getProducts(
  options?: FilterOptions & { page?: number; pageSize?: number },
): Promise<PaginatedResponse<Product>> {
  const supabase = await getSupabaseServerClient()
  const page = options?.page || 1
  const pageSize = options?.pageSize || 12
  const offset = (page - 1) * pageSize

  let query = supabase.from("products").select(
    `
      *,
      categories(name),
      brands(name),
      product_images(url, alt, position)
    `,
    { count: "exact" },
  )

  // Apply filters
  if (options?.categories?.length) {
    query = query.in("category_id", options.categories)
  }
  if (options?.brands?.length) {
    query = query.in("brand_id", options.brands)
  }
  if (options?.minPrice !== undefined) {
    query = query.gte("price", options.minPrice)
  }
  if (options?.maxPrice !== undefined) {
    query = query.lte("price", options.maxPrice)
  }
  if (options?.inStock) {
    query = query.gt("stock", 0)
  }

  // Apply sorting
  switch (options?.sortBy) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "name":
      query = query.order("name", { ascending: true })
      break
    case "newest":
      query = query.order("created_at", { ascending: false })
      break
    default:
      query = query.order("featured", { ascending: false }).order("created_at", { ascending: false })
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching products:", error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const products = (data || []).map(transformProduct)
  const total = count || 0

  return {
    data: products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await getSupabaseServerClient()

  // Normalize slug
  const normalizedSlug = slug.toLowerCase().trim()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories(name),
      brands(name),
      product_images(url, alt, position)
    `)
    .eq("slug", normalizedSlug)
    .single()

  if (error) {
    console.error("Error fetching product by slug:", error, "slug:", normalizedSlug)
    return null
  }

  if (!data) {
    console.log("No product found for slug:", normalizedSlug)
    return null
  }

  return transformProduct(data)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories(name),
      brands(name),
      product_images(url, alt, position)
    `)
    .eq("featured", true)
    .gt("stock", 0)
    .limit(8)

  if (error) {
    console.error("Error fetching featured products:", error)
    return []
  }

  return (data || []).map(transformProduct)
}

export async function getProductsByCategory(
  categorySlug: string,
  options?: FilterOptions & { page?: number; pageSize?: number },
): Promise<PaginatedResponse<Product>> {
  const supabase = await getSupabaseServerClient()
  const page = options?.page || 1
  const pageSize = options?.pageSize || 12
  const offset = (page - 1) * pageSize

  // First get the category
  const { data: category } = await supabase.from("categories").select("id, parent_id").eq("slug", categorySlug).single()

  if (!category) {
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  // Get all category IDs to search (the category itself + its children if it's a main category)
  let categoryIds = [category.id]

  // If this is a main category (no parent), also get all its subcategory IDs
  if (!category.parent_id) {
    const { data: children } = await supabase.from("categories").select("id").eq("parent_id", category.id)

    if (children?.length) {
      categoryIds = [...categoryIds, ...children.map((c) => c.id)]
    }
  }

  let query = supabase
    .from("products")
    .select(
      `
      *,
      categories(name),
      brands(name),
      product_images(url, alt, position)
    `,
      { count: "exact" },
    )
    .in("category_id", categoryIds)

  // Apply filters
  if (options?.brands?.length) {
    query = query.in("brand_id", options.brands)
  }
  if (options?.minPrice !== undefined) {
    query = query.gte("price", options.minPrice)
  }
  if (options?.maxPrice !== undefined) {
    query = query.lte("price", options.maxPrice)
  }
  if (options?.inStock) {
    query = query.gt("stock", 0)
  }

  // Apply sorting
  switch (options?.sortBy) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "name":
      query = query.order("name", { ascending: true })
      break
    case "newest":
      query = query.order("created_at", { ascending: false })
      break
    default:
      query = query.order("featured", { ascending: false }).order("created_at", { ascending: false })
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching products by category:", error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  return {
    data: (data || []).map(transformProduct),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

export async function getProductsByBrand(
  brandSlug: string,
  options?: FilterOptions & { page?: number; pageSize?: number },
): Promise<PaginatedResponse<Product>> {
  const supabase = await getSupabaseServerClient()
  const page = options?.page || 1
  const pageSize = options?.pageSize || 12
  const offset = (page - 1) * pageSize

  // First get the brand ID
  const { data: brand } = await supabase.from("brands").select("id").eq("slug", brandSlug).single()

  if (!brand) {
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  let query = supabase
    .from("products")
    .select(
      `
      *,
      categories(name),
      brands(name),
      product_images(url, alt, position)
    `,
      { count: "exact" },
    )
    .eq("brand_id", brand.id)

  // Apply sorting
  switch (options?.sortBy) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "name":
      query = query.order("name", { ascending: true })
      break
    case "newest":
      query = query.order("created_at", { ascending: false })
      break
    default:
      query = query.order("featured", { ascending: false })
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching products by brand:", error)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  return {
    data: (data || []).map(transformProduct),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories(name),
      brands(name),
      product_images(url, alt, position)
    `)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
    .limit(20)

  if (error) {
    console.error("Error searching products:", error)
    return []
  }

  return (data || []).map(transformProduct)
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return (data || []).map((cat) => transformCategory(cat))
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single()

  if (error || !data) {
    return null
  }

  // If has parent, fetch parent info
  let parent = null
  if (data.parent_id) {
    const { data: parentData } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("id", data.parent_id)
      .single()
    parent = parentData
  }

  // Fetch children if this is a main category
  const { data: childrenData } = await supabase.from("categories").select("*").eq("parent_id", data.id).order("name")

  const category = transformCategory(data, parent)
  category.children = (childrenData || []).map((child) => transformCategory(child, data))

  return category
}

export async function getCategoriesWithHierarchy(): Promise<Category[]> {
  const supabase = await getSupabaseServerClient()

  // Get all categories
  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  const allCategories = data || []
  
  console.log("Total categories from DB:", allCategories.length)

  // Build hierarchy: main categories (no parent) with their children
  const mainCategories = allCategories
    .filter((cat) => !cat.parent_id)
    .map((mainCat) => {
      const children = allCategories
        .filter((cat) => cat.parent_id === mainCat.id)
        .map((child) => transformCategory(child, mainCat))
      
      console.log(`Category "${mainCat.name}" has ${children.length} children`)

      return {
        ...transformCategory(mainCat),
        children,
      }
    })

  console.log("Main categories built:", mainCategories.length)
  return mainCategories
}

export async function getMainCategories(): Promise<Category[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("categories").select("*").is("parent_id", null).order("name")

  if (error) {
    console.error("Error fetching main categories:", error)
    return []
  }

  return (data || []).map((cat) => transformCategory(cat))
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("categories").select("*").eq("parent_id", parentId).order("name")

  if (error) {
    console.error("Error fetching subcategories:", error)
    return []
  }

  return (data || []).map((cat) => transformCategory(cat))
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("brands").select("*").order("name")

  if (error) {
    console.error("Error fetching brands:", error)
    return []
  }

  return (data || []).map(transformBrand)
}

export async function getFeaturedBrands(): Promise<Brand[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("brands").select("*").eq("featured", true).order("name")

  if (error) {
    console.error("Error fetching featured brands:", error)
    return []
  }

  return (data || []).map(transformBrand)
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("brands").select("*").eq("slug", slug).single()

  if (error || !data) {
    return null
  }

  return transformBrand(data)
}

export async function getWilayas(): Promise<Wilaya[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("wilayas").select("*").eq("is_active", true).order("code")

  if (error) {
    console.error("Error fetching wilayas:", error)
    return []
  }

  return (data || []).map((w) => ({
    id: w.id,
    name: w.name,
    code: w.code,
    shippingCost: w.shipping_cost,
    deliveryDays: w.delivery_days,
    isActive: w.is_active,
  }))
}

export async function validatePromoCode(
  code: string,
): Promise<{ valid: boolean; discount?: number; type?: "percentage" | "fixed"; id?: string }> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .gte("valid_until", new Date().toISOString())
    .lte("valid_from", new Date().toISOString())
    .single()

  if (error || !data) {
    return { valid: false }
  }

  // Check if max uses reached
  if (data.max_uses && data.used_count >= data.max_uses) {
    return { valid: false }
  }

  return {
    valid: true,
    discount: data.discount_value,
    type: data.discount_type,
    id: data.id,
  }
}

export async function getRelatedProducts(productId: string): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()

  // Get the product's category
  const { data: product } = await supabase.from("products").select("category_id").eq("id", productId).single()

  if (!product) return []

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories(name),
      brands(name),
      product_images(url, alt, position)
    `)
    .eq("category_id", product.category_id)
    .neq("id", productId)
    .gt("stock", 0)
    .limit(4)

  if (error) {
    console.error("Error fetching related products:", error)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map(transformProduct)
}
