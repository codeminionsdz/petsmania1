import { getSupabaseServerClient } from "./supabase/server"
import type { Product, Category, Brand, Wilaya, PaginatedResponse, FilterOptions, Animal, Subcategory, AnimalType, BrandAnimal } from "./types"

// ============================================================================
// HELPER FUNCTIONS - SAFE QUERIES
// ============================================================================

/**
 * Safely get the UUID for an animal by its slug
 * Looks up animal in the animals table using the slug field
 * Returns the UUID or null if not found
 * 
 * @param animalType - The animal type/slug (cat, dog, bird, other)
 * @returns The animal UUID or null if not found
 */
export async function getAnimalUUID(animalType: AnimalType): Promise<string | null> {
  const timerLabel = `[getAnimalUUID] ${animalType} ${Date.now()}-${Math.random()}`
  console.time(timerLabel)
  
  try {
    const supabase = await getSupabaseServerClient()
    console.debug(`[getAnimalUUID] Got Supabase client for ${animalType}`)
    
    console.debug(`[getAnimalUUID] Looking up UUID for animal slug: "${animalType}"`)
    
    // Query animals table using slug field
    // Slug values match the AnimalType values: cat, dog, bird, other
    const { data, error } = await supabase
      .from("animals")
      .select("id, slug, name")
      .eq("slug", animalType)
      .limit(1)
    
    console.debug(`[getAnimalUUID] Query returned for ${animalType}`)
    
    // Handle query errors gracefully
    if (error) {
      console.error(
        `[getAnimalUUID] Database error looking up animal slug "${animalType}":`,
        {
          message: error.message,
          code: error.code,
          hint: error.hint,
        }
      )
      return null
    }
    
    // Handle missing animal gracefully
    if (!data || data.length === 0) {
      console.warn(
        `[getAnimalUUID] Animal with slug "${animalType}" not found in animals table`
      )
      console.warn(
        `[getAnimalUUID] Available animal slugs should be: cat, dog, bird, other`
      )
      return null
    }
    
    const animal = data[0]
    console.debug(
      `[getAnimalUUID] Found animal: name="${animal.name}", slug="${animal.slug}", id="${animal.id}"`
    )
    
    return animal.id
  } catch (exception) {
    console.error(
      `[getAnimalUUID] Unexpected error fetching animal UUID for "${animalType}":`,
      exception instanceof Error ? exception.message : String(exception)
    )
    return null
  } finally {
    console.timeEnd(timerLabel)
  }
}

/**
 * Validate that an animal type is valid
 * Ensures categories can only be accessed with a valid animal context
 * @throws Error if animal type is invalid
 */
export function validateAnimalContext(animalType: unknown): asserts animalType is AnimalType {
  const validTypes: AnimalType[] = ["cat", "dog", "bird", "other"]
  
  if (!animalType || typeof animalType !== "string") {
    throw new Error(
      "Invalid animal context: No animal type provided. Please select an animal first (cat, dog, bird, or other)"
    )
  }
  
  if (!validTypes.includes(animalType as AnimalType)) {
    throw new Error(
      `Invalid animal type: "${animalType}". Must be one of: ${validTypes.join(", ")}`
    )
  }
}

// ============================================================================
// TRANSFORMATION FUNCTIONS - CONVERT DATABASE RECORDS TO FRONTEND TYPES
// ============================================================================

// Transform DB product to frontend Product type
// Supports both new hierarchical model and backward compatibility
function transformProduct(dbProduct: any): Product {
  // Try new hierarchical model first
  if (dbProduct.animal_id || dbProduct.animal_name) {
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
      // Mandatory: animal
      animalId: dbProduct.animal_id,
      animalName: dbProduct.animal_name,
      // Category hierarchy
      categoryId: dbProduct.category_id,
      categoryName: dbProduct.category_name || dbProduct.categories?.name,
      categorySlug: dbProduct.category_slug,
      subcategoryId: dbProduct.subcategory_id,
      subcategoryName: dbProduct.subcategory_name,
      subcategorySlug: dbProduct.subcategory_slug,
      // Brand (optional)
      brandId: dbProduct.brand_id,
      brandName: dbProduct.brand_name || dbProduct.brands?.name,
      brandSlug: dbProduct.brand_slug,
      stock: dbProduct.stock,
      sku: dbProduct.sku,
      featured: dbProduct.featured,
      tags: dbProduct.tags || [],
      // Backward compatibility
      animalType: dbProduct.animal_type,
      createdAt: dbProduct.created_at,
      updatedAt: dbProduct.updated_at,
    }
  }
  
  // Fallback to legacy model for backward compatibility
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
    animalId: dbProduct.animal_id || "",
    categoryId: dbProduct.category_id,
    categoryName: dbProduct.categories?.name || "",
    brandId: dbProduct.brand_id,
    brandName: dbProduct.brands?.name || "",
    stock: dbProduct.stock,
    sku: dbProduct.sku,
    featured: dbProduct.featured,
    tags: dbProduct.tags || [],
    animalType: dbProduct.animal_type,
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
    parent_id: dbCategory.parent_id, // Alias
    parentName: parent?.name || dbCategory.parent?.name,
    parentSlug: parent?.slug || dbCategory.parent?.slug,
    level: dbCategory.level || 1,
    productCount: dbCategory.product_count || 0,
    product_count: dbCategory.product_count || 0, // Alias
    children: [],
    animalType: dbCategory.animal_type,
    animal_type: dbCategory.animal_type, // Alias
    isActive: dbCategory.is_active !== false,
    is_active: dbCategory.is_active !== false, // Alias
  }
}

function transformSubcategory(dbSubcategory: any): Subcategory {
  return {
    id: dbSubcategory.id,
    name: dbSubcategory.name,
    slug: dbSubcategory.slug,
    description: dbSubcategory.description || "",
    image: dbSubcategory.image || "",
    category_id: dbSubcategory.category_id, // Primary field
    categoryId: dbSubcategory.category_id,  // Alias for backward compatibility
    categoryName: dbSubcategory.category_name,
    animalType: dbSubcategory.animal_type,
    animal_type: dbSubcategory.animal_type, // Alias
    isActive: dbSubcategory.is_active !== false,
    is_active: dbSubcategory.is_active !== false, // Alias
    productCount: dbSubcategory.product_count || 0,
    product_count: dbSubcategory.product_count || 0, // Alias
  }
}

function transformAnimal(dbAnimal: any): Animal {
  return {
    id: dbAnimal.id,
    name: dbAnimal.name,
    slug: dbAnimal.slug,
    displayName: dbAnimal.name,
    emoji: dbAnimal.icon || "🐾",
    description: dbAnimal.description,
    featured: dbAnimal.featured || false,
    isActive: dbAnimal.is_active !== false,
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
    animalTypes: dbBrand.animal_types,
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
  if (options?.animalTypes?.length) {
    // Include products with matching animalType OR products with NULL animalType (backward compatible)
    query = query.or(`animal_type.in.(${options.animalTypes.map((t) => `"${t}"`).join(",")}),animal_type.is.null`)
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
    console.error("Error fetching products:", error?.message || JSON.stringify(error))
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
    console.error("Error fetching product by slug:", error?.message || JSON.stringify(error), "slug:", normalizedSlug)
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

  console.debug(`[getFeaturedProducts] Fetching featured products with stock > 0, limit: 8`)

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
    console.error(
      `[getFeaturedProducts] Error fetching featured products:`,
      error || "Unknown error"
    )
    // Safely return empty array - not an error condition if no featured products exist
    return []
  }

  // Safely handle null or undefined data
  const products = data || []
  console.debug(`[getFeaturedProducts] Found ${products.length} featured products`)

  return products.map(transformProduct)
}

export async function getProductsByCategory(
  categorySlug: string,
  options?: FilterOptions & { page?: number; pageSize?: number },
): Promise<PaginatedResponse<Product>> {
  const supabase = await getSupabaseServerClient()
  const page = options?.page || 1
  const pageSize = options?.pageSize || 12
  const offset = (page - 1) * pageSize

  console.log("[getProductsByCategory] Fetching products for category slug:", categorySlug)

  // First get the category
  const { data: category, error: catError } = await supabase.from("categories").select("id, parent_id").eq("slug", categorySlug).single()

  if (catError || !category) {
    console.log("[getProductsByCategory] Category not found for slug:", categorySlug)
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  console.log("[getProductsByCategory] Category found:", { id: category.id, parent_id: category.parent_id })

  // Get all category IDs to search (the category itself + its children if it's a main category)
  let categoryIds = [category.id]

  // If this is a main category (no parent), also get all its subcategory IDs
  if (!category.parent_id) {
    const { data: children } = await supabase.from("categories").select("id").eq("parent_id", category.id)

    if (children?.length) {
      categoryIds = [...categoryIds, ...children.map((c) => c.id)]
      console.log("[getProductsByCategory] Added subcategory IDs:", children.map((c) => c.id))
    }
  }

  console.log("[getProductsByCategory] Searching for products with category_id OR subcategory_id in:", categoryIds)

  // Build query - use simple approach: fetch all matching products
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

  // Filter by category_id OR subcategory_id 
  // Supabase .or() requires proper condition syntax
  query = query.or(`category_id.in.(${categoryIds.map(id => `"${id}"`).join(",")}),subcategory_id.in.(${categoryIds.map(id => `"${id}"`).join(",")})`)

  // Apply other filters
  if (options?.brands?.length) {
    console.log("[getProductsByCategory] Applying brand filter:", options.brands)
    query = query.in("brand_id", options.brands)
  }
  
  if (options?.minPrice !== undefined) {
    console.log("[getProductsByCategory] Applying min price filter:", options.minPrice)
    query = query.gte("price", options.minPrice)
  }
  
  if (options?.maxPrice !== undefined) {
    console.log("[getProductsByCategory] Applying max price filter:", options.maxPrice)
    query = query.lte("price", options.maxPrice)
  }
  
  if (options?.inStock) {
    console.log("[getProductsByCategory] Filtering for in-stock products only")
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

  console.log("[getProductsByCategory] Executing query...")
  const { data, error, count } = await query

  if (error) {
    console.error("[getProductsByCategory] ❌ Error fetching products by category:", {
      message: error.message,
      code: error.code,
      details: error.details
    })
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  console.log("[getProductsByCategory] ✅ Query returned:", { count, dataLength: data?.length })
  if (data && data.length > 0) {
    console.log("[getProductsByCategory] Sample products:", data.slice(0, 2).map(p => ({
      id: p.id,
      name: p.name,
      category_id: p.category_id,
      subcategory_id: p.subcategory_id
    })))
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
    console.error("Error fetching products by brand:", error?.message || JSON.stringify(error))
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
    console.error("Error searching products:", error?.message || JSON.stringify(error))
    return []
  }

  return (data || []).map(transformProduct)
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await getSupabaseServerClient()

  console.debug(`[getCategories] Fetching all categories`)

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  if (error) {
    console.error(
      `[getCategories] Error fetching categories:`,
      {
        message: error.message,
        code: error.code,
        details: error.details,
      }
    )
    // Safely return empty array on error
    return []
  }

  // Safely handle null or undefined data
  const categories = data || []
  console.debug(`[getCategories] Found ${categories.length} total categories`)

  return categories.map((cat) => transformCategory(cat))
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await getSupabaseServerClient()

  // Build candidate slug variations to handle encoded or space/hyphen differences
  const originalSlug = slug
  let decodedSlug = slug
  try {
    decodedSlug = decodeURIComponent(slug)
  } catch (e) {
    // ignore decode errors and keep original
  }

  const candidates = Array.from(
    new Set([
      originalSlug,
      decodedSlug,
      decodedSlug.toLowerCase().trim(),
      decodedSlug.replace(/\s+/g, "-").toLowerCase().trim(),
    ])
  )

  console.log("[getCategoryBySlug] Lookup candidates:", candidates)

  let data: any = null
  let error: any = null

  // Try each candidate until one matches
  for (const s of candidates) {
    const res = await supabase.from("categories").select("*").eq("slug", s).single()
    if (res && res.data) {
      data = res.data
      error = res.error
      break
    }
  }

  if (error || !data) {
    // If not found in categories table, try the subcategories table (some setups store subcats separately)
    try {
      let subData: any = null
      let subError: any = null

      for (const s of candidates) {
        const res = await supabase.from("subcategories").select("*").eq("slug", s).single()
        if (res && res.data) {
          subData = res.data
          subError = res.error
          break
        }
      }

      if (subError || !subData) {
        return null
      }

      // Fetch parent category info for breadcrumbs/context
      let parent = null
      if (subData.category_id) {
        const { data: parentData } = await supabase
          .from("categories")
          .select("id, name, slug")
          .eq("id", subData.category_id)
          .single()
        parent = parentData
      }

      // Map subcategory record into a Category-like object so the existing page can render it
      const pseudoCategory = transformCategory(
        {
          id: subData.id,
          name: subData.name,
          slug: subData.slug,
          description: subData.description,
          image: subData.image,
          parent_id: subData.category_id,
          level: 2,
          product_count: subData.product_count || 0,
          animal_type: subData.animal_type,
          is_active: subData.is_active,
        },
        parent
      )

      // No children for a subcategory
      pseudoCategory.children = []
      return pseudoCategory
    } catch (inner) {
      return null
    }
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

  console.log("[getCategoriesWithHierarchy] Starting to fetch categories...")

  // Get all categories
  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("[getCategoriesWithHierarchy] Error fetching categories:", {
      message: error.message,
      code: error.code,
      details: error.details,
    })
    return []
  }

  const allCategories = data || []
  
  console.log("[getCategoriesWithHierarchy] Total categories from DB:", allCategories.length)
  console.log("[getCategoriesWithHierarchy] Categories list:", allCategories.map(c => ({
    id: c.id,
    name: c.name,
    parent_id: c.parent_id,
    slug: c.slug
  })))

  // Build hierarchy: main categories (no parent) with their children
  const mainCategories = allCategories
    .filter((cat) => !cat.parent_id)
    .map((mainCat) => {
      const children = allCategories
        .filter((cat) => cat.parent_id === mainCat.id)
        .map((child) => transformCategory(child, mainCat))
      
      console.log(`[getCategoriesWithHierarchy] Category "${mainCat.name}" (id: ${mainCat.id}) has ${children.length} children`)

      return {
        ...transformCategory(mainCat),
        children,
      }
    })

  console.log("[getCategoriesWithHierarchy] Main categories built:", mainCategories.length)
  return mainCategories
}

export async function getMainCategories(): Promise<Category[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("categories").select("*").is("parent_id", null).order("name")

  if (error) {
    console.error("Error fetching main categories:", error?.message || JSON.stringify(error))
    return []
  }

  return (data || []).map((cat) => transformCategory(cat))
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.from("categories").select("*").eq("parent_id", parentId).order("name")

  if (error) {
    console.error("Error fetching subcategories:", error?.message || JSON.stringify(error))
    return []
  }

  return (data || []).map((cat) => transformCategory(cat))
}

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 500
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt < maxRetries) {
        const delayMs = initialDelayMs * Math.pow(2, attempt)
        console.debug(`[retryWithBackoff] Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }
  
  throw lastError
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await getSupabaseServerClient()

  console.debug(`[getBrands] Fetching all brands`)

  try {
    // Try with retry logic for timeout resilience
    const { data, error } = await retryWithBackoff(
      () => supabase
        .from("brands")
        .select("*")
        .order("name"),
      2, // max 2 retries (3 total attempts)
      1000 // initial 1s delay
    )

    if (error) {
      try {
        console.error(`[getBrands] Error fetching brands: ${JSON.stringify(error)}`)
      } catch (e) {
        console.error(`[getBrands] Error fetching brands:`, error || "Unknown error")
      }
      // Safely return empty array - not an error if no brands exist
      return []
    }

    // Safely handle null or undefined data
    const brands = data || []
    console.debug(`[getBrands] Found ${brands.length} total brands`)

    return brands.map(transformBrand)
  } catch (exception) {
    console.error(
      `[getBrands] Failed after retries:`,
      exception instanceof Error ? exception.message : String(exception)
    )
    // Return empty array on all failures - graceful degradation
    return []
  }
}

export async function getFeaturedBrands(): Promise<Brand[]> {
  const supabase = await getSupabaseServerClient()

  console.debug(`[getFeaturedBrands] Fetching featured brands`)

  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("featured", true)
    .order("name")

  if (error) {
    console.error(
      `[getFeaturedBrands] Error fetching featured brands:`,
      {
        message: error.message,
        code: error.code,
        details: error.details,
      }
    )
    // Safely return empty array - not an error if no featured brands exist
    return []
  }

  // Safely handle null or undefined data
  const brands = data || []
  console.debug(`[getFeaturedBrands] Found ${brands.length} featured brands`)

  return brands.map(transformBrand)
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
    console.error("Error fetching wilayas:", error?.message || JSON.stringify(error))
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
    console.error("Error fetching related products:", error?.message || JSON.stringify(error))
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map(transformProduct)
}

// ============================================
// ANIMAL-CENTRIC DATA LAYER (Phase 1)
// ============================================

/**
 * Get all categories for a specific animal type
 * Includes NULL animal_type for backward compatibility
 */
export async function getCategoriesByAnimal(
  animalType: "cat" | "dog" | "bird" | "other"
): Promise<Category[]> {
  const supabase = await getSupabaseServerClient()

  // Validate animal type
  const validTypes = ["cat", "dog", "bird", "other", "universal"]
  if (!validTypes.includes(animalType)) {
    console.error(`Invalid animal type: ${animalType}. Expected one of: ${validTypes.join(", ")}`)
    return []
  }

  console.debug(
    `[getCategoriesByAnimal] Fetching categories for animal: "${animalType}" (type: ${typeof animalType})`
  )

  // Get categories with this animal type
  let query = supabase
    .from("categories")
    .select(
      `
      id,
      name,
      slug,
      description,
      image,
      animal_type,
      parent_id,
      product_count
    `,
      { count: "exact" }
    )

  // Get categories for this animal OR universal categories
  const filterCondition = `animal_type.eq.${animalType},animal_type.eq.universal`
  console.debug(`[getCategoriesByAnimal] Filter condition: "${filterCondition}"`)

  query = query.or(filterCondition)
  query = query.order("name", { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error(
      `[getCategoriesByAnimal] Error fetching categories for animal "${animalType}":`,
      {
        message: error.message,
        code: error.code,
        details: error.details,
      }
    )
    return []
  }

  // Safely handle empty results
  const categories = (data || [])
  console.debug(`[getCategoriesByAnimal] Found ${categories.length} categories for animal "${animalType}"`)

  const transformed = categories.map((cat) => {
    console.debug(`[getCategoriesByAnimal] Category: id="${cat.id}", name="${cat.name}", animal_type="${cat.animal_type}"`)
    return transformCategory(cat)
  })

  return transformed
}

/**
 * Get all brands for a specific animal type
 * Shows brands that have products for this animal
 */
export async function getBrandsForAnimal(
  animalType: "cat" | "dog" | "bird" | "other"
): Promise<Brand[]> {
  const supabase = await getSupabaseServerClient()

  console.debug(`[getBrandsForAnimal] Fetching brands for animal: "${animalType}"`)

  const { data, error } = await supabase
    .rpc(
      "get_brands_for_animal",
      { p_animal_type: animalType }
    )

  if (error) {
    // Log warning but don't treat as fatal error - return empty array
    console.warn(
      `[getBrandsForAnimal] RPC get_brands_for_animal failed for "${animalType}", falling back to all brands:`,
      {
        message: error.message,
        code: error.code,
      }
    )
    // Fallback: return all brands if RPC not available
    const allBrands = await getBrands()
    console.debug(`[getBrandsForAnimal] Fallback returned ${allBrands.length} brands`)
    return allBrands
  }

  // Safely handle null or undefined data
  const brands = data || []
  console.debug(`[getBrandsForAnimal] Found ${brands.length} brands for animal "${animalType}"`)

  return brands.map(transformBrand)
}

/**
 * Get featured products for a specific animal type
 * Perfect for animal-specific landing pages
 */
export async function getFeaturedProductsByAnimal(
  animalType: "cat" | "dog" | "bird" | "other",
  limit: number = 8
): Promise<Product[]> {
  const supabase = await getSupabaseServerClient()

  console.debug(
    `[getFeaturedProductsByAnimal] Fetching featured products for animal: "${animalType}", limit: ${limit}`
  )

  let query = supabase
    .from("products")
    .select(
      `
      *,
      categories(name),
      brands(name),
      product_images(url, alt, position)
    `
    )
    .eq("featured", true)
    .or(`animal_type.eq.${animalType},animal_type.is.null`)
    .order("created_at", { ascending: false })
    .limit(limit)

  const { data, error } = await query

  if (error) {
    console.error(
      `[getFeaturedProductsByAnimal] Error fetching featured products for "${animalType}":`,
      {
        message: error.message,
        code: error.code,
        details: error.details,
      }
    )
    // Safely return empty array - not an error if no featured products exist
    return []
  }

  // Safely handle null or undefined data
  const products = data || []
  console.debug(`[getFeaturedProductsByAnimal] Found ${products.length} featured products for "${animalType}"`)

  return products.map(transformProduct)
}

/**
 * Get products by animal and category
 * The primary way to browse in animal-centric model
 */
export async function getProductsByAnimalAndCategory(
  animalType: "cat" | "dog" | "bird" | "other",
  categorySlug: string,
  options?: FilterOptions & { page?: number; pageSize?: number }
): Promise<PaginatedResponse<Product>> {
  const supabase = await getSupabaseServerClient()
  const page = options?.page || 1
  const pageSize = options?.pageSize || 12
  const offset = (page - 1) * pageSize

  // First get the category
  const { data: category } = await supabase
    .from("categories")
    .select("id, parent_id")
    .eq("slug", categorySlug)
    .single()

  if (!category) {
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }

  // Get all category IDs to search (the category itself + its children if it's a main category)
  let categoryIds = [category.id]

  // If this is a main category (no parent), also get all its subcategory IDs
  if (!category.parent_id) {
    const { data: children } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", category.id)

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
      { count: "exact" }
    )
    .in("category_id", categoryIds)
    // Filter by animal: this animal OR products without an animal type
    .or(`animal_type.eq.${animalType},animal_type.is.null`)

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
    console.error(`Error fetching products for ${animalType}/${categorySlug}:`, error?.message || JSON.stringify(error))
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

/**
 * Check if a category is relevant for an animal
 * Useful for conditional rendering in UI
 */
export async function isCategoryForAnimal(
  categoryId: string,
  animalType: "cat" | "dog" | "bird" | "other"
): Promise<boolean> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .or(`primary_animal_type.eq.${animalType},primary_animal_type.is.null`)
    .single()

  if (error) {
    console.error(`Error checking category ${categoryId} for animal ${animalType}:`, error?.message || JSON.stringify(error))
    return false
  }

  return !!data
}
// ============================================================================
// NEW HIERARCHICAL MODEL FUNCTIONS
// ============================================================================

/**
 * Get all animals
 * Returns list of available animals for navigation
 */
export async function getAnimals(): Promise<Animal[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching animals:", error?.message || JSON.stringify(error))
    return []
  }

  return (data || []).map(transformAnimal)
}

/**
 * Get a single animal by slug
 */
export async function getAnimalBySlug(slug: string): Promise<Animal | null> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("animals")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error) {
    console.error(`Error fetching animal ${slug}:`, error)
    return null
  }

  return transformAnimal(data)
}

/**
 * Get all categories for a specific animal
 * Returns only main categories (parent_id IS NULL) that match the animal
 */
export async function getCategoriesForAnimal(
  animalType: AnimalType
): Promise<Category[]> {
  const timerLabel = `[getCategoriesForAnimal] ${animalType} ${Date.now()}-${Math.random()}`
  console.time(timerLabel)
  
  try {
    const supabase = await getSupabaseServerClient()

    // Validate animal type
    const validTypes: AnimalType[] = ["cat", "dog", "bird", "other"]
    if (!validTypes.includes(animalType)) {
      console.error(
        `[getCategoriesForAnimal] Invalid animal type: "${animalType}". Expected one of: ${validTypes.join(", ")}`
      )
      return []
    }

    console.debug(
      `[getCategoriesForAnimal] Fetching categories for animal: "${animalType}" (type: ${typeof animalType})`
    )

    // Build the filter condition for OR query
    // We want: (animal_type = animalType OR animal_type = 'universal') AND parent_id IS NULL AND is_active = true
    // Supabase OR syntax: "field.eq.value1,field.eq.value2"
    const filterCondition = `animal_type.eq.${animalType},animal_type.eq.universal`
    console.debug(`[getCategoriesForAnimal] Filter condition: "${filterCondition}"`)

    console.debug(`[getCategoriesForAnimal] Executing query for ${animalType}...`)

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .is("parent_id", null) // Only main categories (no parents)
        .or(filterCondition) // Include animal-specific and universal categories
        .order("name", { ascending: true })

      console.debug(`[getCategoriesForAnimal] Query completed for ${animalType}, got ${data?.length || 0} categories`)

      if (error) {
        console.error(
          `[getCategoriesForAnimal] Supabase error for animal "${animalType}":`,
          error
        )
        console.error(
          `[getCategoriesForAnimal] Error details:`,
          {
            message: error.message,
            code: error.code,
            details: error.details,
            statusCode: error.statusCode,
            hint: error.hint,
          }
        )
        // Safely return empty array on error
        return []
      }

      // Safely handle null or undefined data
      const categories = data || []
      console.debug(
        `[getCategoriesForAnimal] Found ${categories.length} categories for animal "${animalType}"`
      )

      // Log individual categories for debugging
      categories.forEach((cat, index) => {
        console.debug(
          `[getCategoriesForAnimal] [${index}] id="${cat.id}", name="${cat.name}", animal_type="${cat.animal_type}"`
        )
      })

      // Transform and return
      return categories.map((cat) => transformCategory(cat))
    } catch (error) {
      console.error(
        `[getCategoriesForAnimal] Query error for animal "${animalType}":`,
        error instanceof Error ? error.message : String(error)
      )
      return []
    }
  } catch (exception) {
    console.error(
      `[getCategoriesForAnimal] Unexpected error for animal "${animalType}":`,
      exception instanceof Error ? exception.message : String(exception)
    )
    return []
  } finally {
    console.timeEnd(timerLabel)
  }

}

/**
 * Get all subcategories for a specific category and animal
 * Ensures subcategories belong to the correct category and animal context
 * Falls back to categories with parent_id if subcategories table is empty
 */
export async function getSubcategoriesForCategory(
  categoryId: string,
  animalType?: AnimalType
): Promise<Subcategory[]> {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)

  // If animal type specified, only return subcategories for that animal or universal ones
  if (animalType) {
    query = query.or(`animal_type.eq.${animalType},animal_type.is.null`)
  }

  const { data, error } = await query
    .order("name", { ascending: true })

  if (error) {
    console.error(`Error fetching subcategories for category ${categoryId}:`, error)
  }

  // If subcategories table has data, return it
  if (data && data.length > 0) {
    return (data || []).map(transformSubcategory)
  }

  // Fallback: Get subcategories from categories table (where parent_id = categoryId)
  console.log(`[getSubcategoriesForCategory] Falling back to categories table for categoryId: ${categoryId}`)
  
  let categoryQuery = supabase
    .from("categories")
    .select("*")
    .eq("parent_id", categoryId)

  // If animal type specified, only return categories for that animal or universal ones
  if (animalType) {
    categoryQuery = categoryQuery.or(`animal_type.eq.${animalType},animal_type.is.null`)
  }

  const { data: categoriesData, error: categoriesError } = await categoryQuery
    .order("name", { ascending: true })

  if (categoriesError) {
    console.error(`Error fetching subcategories from categories table for category ${categoryId}:`, categoriesError)
    return []
  }

  console.log(`[getSubcategoriesForCategory] Found ${categoriesData?.length || 0} subcategories for category ${categoryId}`)
  console.log(`[getSubcategoriesForCategory] Sample data:`, categoriesData?.slice?.(0, 2))

  const subcats = (categoriesData || []).map((cat: any) => {
    const sub = {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      category_id: cat.parent_id,
      categoryId: cat.parent_id,
      categoryName: "",
      animalType: cat.animal_type,
      animal_type: cat.animal_type,
      displayOrder: cat.display_order || cat.product_count || 999,
      display_order: cat.display_order || cat.product_count || 999,
      isActive: cat.is_active !== false,
      is_active: cat.is_active !== false,
      productCount: cat.product_count || 0,
      product_count: cat.product_count || 0,
    }
    console.log(`[getSubcategoriesForCategory] Mapped: "${cat.name}" -> animal: ${cat.animal_type}`)
    return sub
  })

  console.log(`[getSubcategoriesForCategory] Returning ${subcats.length} subcategories`)
  return subcats
}

/**
 * Get all active subcategories (used for hierarchical filtering)
 * Returns all subcategories to allow client-side filtering
 * Falls back to categories with parent_id if subcategories table is empty
 */
export async function getAllSubcategories(): Promise<Subcategory[]> {
  const supabase = await getSupabaseServerClient()

  console.log("[getAllSubcategories] Starting to fetch all subcategories...")

  // First try to fetch from subcategories table
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .eq("is_active", true)
    .order("category_id", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("[getAllSubcategories] Error fetching from subcategories table:", {
      message: error.message,
      code: error.code,
      hint: error.hint,
      details: error.details
    })
  }

  // If subcategories table has data, return it
  if (data && data.length > 0) {
    console.log("[getAllSubcategories] Returning", data.length, "subcategories from subcategories table")
    return (data || []).map(transformSubcategory)
  }

  // Fallback: Get subcategories from categories table (where parent_id is not null)
  // Use a JOIN to get the parent category name
  console.log("[getAllSubcategories] Subcategories table is empty, falling back to categories table")
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      image,
      parent_id,
      animal_type,
      product_count,
      created_at,
      updated_at,
      display_order,
      is_active
    `)
    .not("parent_id", "is", null)
    .order("parent_id", { ascending: true })
    .order("name", { ascending: true })

  if (categoriesError) {
    console.error("[getAllSubcategories] Error fetching subcategories from categories table:", {
      message: categoriesError.message,
      code: categoriesError.code,
      hint: categoriesError.hint,
      details: categoriesError.details
    })
    return []
  }

  console.log("[getAllSubcategories] Found", categoriesData?.length || 0, "categories with parent_id")
  if (categoriesData && categoriesData.length > 0) {
    console.log("[getAllSubcategories] Sample categories:", categoriesData.slice(0, 3).map(c => ({
      id: c.id,
      name: c.name,
      parent_id: c.parent_id,
      animal_type: c.animal_type
    })))
  }

  // Now fetch parent category names for better display
  let parentNames: Record<string, string> = {}
  if (categoriesData && categoriesData.length > 0) {
    const parentIds = [...new Set(categoriesData.map(c => c.parent_id).filter(Boolean))]
    
    if (parentIds.length > 0) {
      const { data: parentData } = await supabase
        .from("categories")
        .select("id, name")
        .in("id", parentIds)
      
      if (parentData) {
        parentData.forEach(p => {
          parentNames[p.id] = p.name
        })
      }
    }
  }

  const subcats = (categoriesData || []).map((cat: any) => {
    const sub: Subcategory = {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      category_id: cat.parent_id, // Map parent_id to category_id for filtering
      categoryId: cat.parent_id,  // Alias for compatibility
      categoryName: parentNames[cat.parent_id] || "",
      animalType: cat.animal_type,
      animal_type: cat.animal_type,
      displayOrder: cat.display_order || 999,
      display_order: cat.display_order || 999,
      isActive: cat.is_active !== false,
      is_active: cat.is_active !== false,
      productCount: cat.product_count || 0,
      product_count: cat.product_count || 0,
    }
    console.log(`[getAllSubcategories] Mapped subcategory:`)
    console.log(`  - id: "${sub.id}"`)
    console.log(`  - name: "${sub.name}"`)
    console.log(`  - category_id: "${sub.category_id}"`)
    console.log(`  - categoryName: "${sub.categoryName}"`)
    console.log(`  - animal_type: "${sub.animal_type}"`)
    return sub
  })

  console.log("[getAllSubcategories] Returning", subcats.length, "subcategories from categories table")
  if (subcats.length > 0) {
    console.log("[getAllSubcategories] Sample mapped subcats:", subcats.slice(0, 3).map(s => ({
      id: s.id,
      name: s.name,
      category_id: s.category_id,
      categoryName: s.categoryName
    })))
  }
  return subcats
}

/**
 * Get products by animal, category, and optional subcategory
 * Main function for browsing products in hierarchical structure
 * 
 * animalType: Required - which animal (cat, dog, bird, other)
 * categoryId: Optional - filter by category
 * subcategoryId: Optional - filter by subcategory (requires categoryId)
 * options: FilterOptions including brand, price, stock, pagination, sorting
 */
export async function getProductsByHierarchy(
  animalType: AnimalType,
  categoryId?: string,
  subcategoryId?: string,
  options?: FilterOptions & { page?: number; pageSize?: number }
): Promise<PaginatedResponse<Product>> {
  const timerId = `[getProductsByHierarchy] Total time for ${animalType}-${Date.now()}`
  console.time(timerId)
  
  try {
    const supabase = await getSupabaseServerClient()
    const page = options?.page || 1
    const pageSize = options?.pageSize || 12
    const offset = (page - 1) * pageSize

    console.debug(`[getProductsByHierarchy] Getting Supabase client... [${animalType}]`)

    // Get the animal UUID - returns null if not found
    const animalUUID = await getAnimalUUID(animalType)
  
    if (!animalUUID) {
      console.error(
        `[getProductsByHierarchy] Failed to get UUID for animal "${animalType}" - returning empty results`
      )
      return { data: [], total: 0, page, pageSize, totalPages: 0 }
    }

    // Validate hierarchy: subcategoryId requires categoryId
    if (subcategoryId && !categoryId) {
      console.warn(
        `Invalid hierarchy: subcategoryId provided without categoryId. Ignoring subcategoryId.`
      )
    }

    console.debug(`[getProductsByHierarchy] Building query for ${animalType}...`)
    
    let query = supabase.from("products").select(
      `*,
       product_images(url, alt, position)`,
      { count: "exact" }
    )

    // Animal is mandatory - use UUID from animals table
    // Per Phase 1 rules: if no categoryId provided, fetch by `animal_id` only.
    // Do NOT reference subcategories in any query (Phase 1 has no subcategories table).
    if (!categoryId || !categoryId.trim()) {
      // Fetch products for the animal only
      query = query.eq("animal_id", animalUUID)
    } else {
      // Fetch products for the animal within the specified category
      query = query.eq("animal_id", animalUUID).eq("category_id", categoryId)
    }
    // If categoryId is undefined or empty, fetch by animal only (no category filter)

    // Brand filter
    if (options?.brands?.length) {
      query = query.in("brand_id", options.brands)
    }

    // Price range filter
    if (options?.minPrice !== undefined) {
      query = query.gte("price", options.minPrice)
    }
    if (options?.maxPrice !== undefined) {
      query = query.lte("price", options.maxPrice)
    }

    // Stock filter
    if (options?.inStock) {
      query = query.gt("stock", 0)
    }

    // Sorting
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
        query = query
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false })
    }

    query = query.range(offset, offset + pageSize - 1)

    console.debug(`[getProductsByHierarchy] Executing query for ${animalType}...`)
    const { data, error, count } = await query
    console.debug(`[getProductsByHierarchy] Query completed for ${animalType}, got ${data?.length || 0} products`)

    if (error) {
      console.error(
        `Error fetching products for ${animalType}/${categoryId}/${subcategoryId}:`,
        error
      )
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
  } finally {
    console.timeEnd(timerId)
  }
}

/**
 * Get brands available for a specific animal
 * Returns brands that have products for that animal
 */
export async function getBrandsForAnimalHierarchy(
  animalType: AnimalType
): Promise<Brand[]> {
  console.time(`[getBrandsForAnimalHierarchy] ${animalType}`)
  
  try {
    const supabase = await getSupabaseServerClient()

    console.debug(
      `[getBrandsForAnimalHierarchy] Fetching brands for animal: "${animalType}"`
    )

    // Get the animal UUID - returns null if not found
    const animalUUID = await getAnimalUUID(animalType)

    if (!animalUUID) {
      console.error(
        `[getBrandsForAnimalHierarchy] Failed to get UUID for animal "${animalType}" - returning empty results`
      )
      return []
    }

    console.debug(`[getBrandsForAnimalHierarchy] Executing query for ${animalType}...`)

    // Query: Get distinct brands from products for this animal
    const { data, error } = await supabase
      .from("products")
      .select("brands(id, name, slug, description, logo, product_count, featured)")
      .eq("primary_animal_id", animalUUID)
      .not("brand_id", "is", null)

    console.debug(`[getBrandsForAnimalHierarchy] Query completed for ${animalType}`)

    if (error) {
      console.error(
        `[getBrandsForAnimalHierarchy] Supabase error for animal "${animalType}":`,
        error?.message || JSON.stringify(error)
      )
      console.error(
        `[getBrandsForAnimalHierarchy] Error details:`,
        {
          message: error?.message,
          code: error?.code,
          details: error?.details,
          statusCode: error?.statusCode,
          hint: error?.hint,
        }
      )
      // Safely return empty array - not an error if no brands exist
      return []
    }

    // Extract unique brands - safely handle null or undefined data
    const brandMap = new Map<string, any>()
    if (data && Array.isArray(data)) {
      data.forEach((row: any) => {
        if (row.brands && row.brands.id && !brandMap.has(row.brands.id)) {
          brandMap.set(row.brands.id, row.brands)
        }
      })
    }

    const brands = Array.from(brandMap.values())
    console.debug(
      `[getBrandsForAnimalHierarchy] Found ${brands.length} unique brands for animal "${animalType}"`
    )

    return brands.map(transformBrand)
  } catch (exception) {
    console.error(
      `[getBrandsForAnimalHierarchy] Unexpected error for animal "${animalType}":`,
      exception instanceof Error ? exception.message : String(exception)
    )
    return []
  } finally {
    console.timeEnd(`[getBrandsForAnimalHierarchy] ${animalType}`)
  }
}

/**
 * Get brands for hierarchical filtering (animal + categories + subcategories)
 * Returns only brands that have products matching the filter criteria
 */
export async function getBrandsForHierarchicalFilter(
  animalType?: AnimalType,
  categoryIds?: string[],
  subcategoryIds?: string[]
): Promise<Brand[]> {
  const supabase = await getSupabaseServerClient()

  // Log query filters for debugging
  console.debug(
    `[getBrandsForHierarchicalFilter] Fetching brands with filters:`,
    {
      animalType: animalType || "none",
      categoryCount: categoryIds?.length || 0,
      subcategoryCount: subcategoryIds?.length || 0,
    }
  )

  let query = supabase
    .from("products")
    .select("brands(id, name, slug, description, logo, product_count, featured)")

  // Filter by animal if specified
  if (animalType) {
    // Get the animal UUID - returns null if not found
    const animalUUID = await getAnimalUUID(animalType)

    if (!animalUUID) {
      console.error(
        `[getBrandsForHierarchicalFilter] Failed to get UUID for animal "${animalType}" - returning empty results`
      )
      return []
    }

    query = query.eq("primary_animal_id", animalUUID)
  }

  // Filter by categories if specified
  if (categoryIds && categoryIds.length > 0) {
    query = query.in("category_id", categoryIds)
  }

  // Filter by subcategories if specified
  if (subcategoryIds && subcategoryIds.length > 0) {
    query = query.in("subcategory_id", subcategoryIds)
  }

  // Only products with brands
  query = query.not("brand_id", "is", null)

  const { data, error } = await query

  if (error) {
    console.error(
      `[getBrandsForHierarchicalFilter] Error fetching brands:`,
      {
        message: error.message,
        code: error.code,
        details: error.details,
        filters: { animalType, categoryIds, subcategoryIds },
      }
    )
    // Safely return empty array - not an error if no brands match filters
    return []
  }

  // Extract unique brands - safely handle null or undefined data
  const brandMap = new Map<string, any>()
  if (data && Array.isArray(data)) {
    data.forEach((row: any) => {
      if (row.brands && row.brands.id && !brandMap.has(row.brands.id)) {
        brandMap.set(row.brands.id, row.brands)
      }
    })
  }

  const brands = Array.from(brandMap.values())
  console.debug(`[getBrandsForHierarchicalFilter] Found ${brands.length} brands matching filters`)

  return brands.map(transformBrand)
}

/**
 * Get featured products for an animal
 * Used for hero sections and featured displays
 */
export async function getFeaturedProductsForAnimal(
  animalType: AnimalType,
  limit: number = 8
): Promise<Product[]> {
  const timerLabel = `[getFeaturedProductsForAnimal] Total for ${animalType}-${Date.now()}-${Math.random()}`
  console.time(timerLabel)
  
  try {
    const supabase = await getSupabaseServerClient()

    console.debug(
      `[getFeaturedProductsForAnimal] Fetching featured products for animal: "${animalType}", limit: ${limit}`
    )

    // Get the animal UUID - returns null if not found
    const animalUUID = await getAnimalUUID(animalType)

    if (!animalUUID) {
      console.error(
        `[getFeaturedProductsForAnimal] Failed to get UUID for animal "${animalType}" - returning empty results`
      )
      return []
    }

    console.debug(`[getFeaturedProductsForAnimal] Executing query for ${animalType}...`)

    try {
      const { data, error } = await supabase
        .from("products")
        .select(`*`)
        .eq("animal_id", animalUUID) // Use animal_id (UUID) only per Phase 1 rules
        .eq("featured", true)
        .gt("stock", 0)
        .order("created_at", { ascending: false })
        .limit(limit)

      console.debug(`[getFeaturedProductsForAnimal] Query completed for ${animalType}, got ${data?.length || 0} products`)

      if (error) {
        console.error(
          `[getFeaturedProductsForAnimal] Supabase error for animal "${animalType}":`,
          error?.message || JSON.stringify(error)
        )
        console.error(
          `[getFeaturedProductsForAnimal] Error details:`,
          {
            message: error?.message,
            code: error?.code,
            details: error?.details,
            statusCode: error?.statusCode,
            hint: error?.hint,
          }
        )
        // Safely return empty array - not an error if no featured products exist
        return []
      }

      // Safely handle null or undefined data
      const products = data || []
      console.debug(`[getFeaturedProductsForAnimal] Found ${products.length} featured products for "${animalType}"`)

      return products.map(transformProduct)
    } catch (error) {
      console.error(
        `[getFeaturedProductsForAnimal] Query error for "${animalType}":`,
        error instanceof Error ? error.message : String(error)
      )
      return []
    }
  } catch (exception) {
    console.error(
      `[getFeaturedProductsForAnimal] Unexpected error for animal "${animalType}":`,
      exception instanceof Error ? exception.message : String(exception)
    )
    return []
  } finally {
    console.timeEnd(timerLabel)
  }
}

/**
 * Validate product hierarchy
 * Ensures animal -> category -> subcategory are properly linked
 */
export async function validateProductHierarchy(
  productId: string
): Promise<{
  isValid: boolean
  errors: string[]
}> {
  const supabase = await getSupabaseServerClient()

  const errors: string[] = []

  // Get product
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single()

  if (productError || !product) {
    return { isValid: false, errors: ["Product not found"] }
  }

  // Animal is mandatory
  if (!product.animal_id) {
    errors.push("Product must have an animal_id")
  }

  // If category is set, check it belongs to the animal
  if (product.category_id) {
    const { data: category } = await supabase
      .from("categories")
      .select("*")
      .eq("id", product.category_id)
      .single()

    if (!category) {
      errors.push("Category not found")
    } else if (
      category.animal_type &&
      category.animal_type !== product.animal_type
    ) {
      errors.push(
        `Category animal_type (${category.animal_type}) doesn't match product animal_type (${product.animal_type})`
      )
    }
  }

  // If subcategory is set, check it belongs to the category and animal
  if (product.subcategory_id) {
    if (!product.category_id) {
      errors.push("Subcategory requires a category")
    } else {
      const { data: subcategory } = await supabase
        .from("subcategories")
        .select("*")
        .eq("id", product.subcategory_id)
        .single()

      if (!subcategory) {
        errors.push("Subcategory not found")
      } else if (subcategory.category_id !== product.category_id) {
        errors.push("Subcategory doesn't belong to the product's category")
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}