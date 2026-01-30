import { NextResponse, NextRequest } from "next/server"
import { getProducts } from "@/lib/data"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { getAnimalUUID } from "@/lib/data"

export async function GET() {
  try {
    const products = await getProducts({ pageSize: 100 })
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ data: [], total: 0 }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { name, slug, sku, price, originalPrice, discount, stock, animalId, categoryId, subcategoryId, brandId, shortDescription, description, tags, featured, images } = body

    console.log("[POST /api/admin/products] Received body:", body)

    // Validate required fields
    if (!name || !slug || !price || !stock) {
      console.error("[POST /api/admin/products] Missing required fields")
      return NextResponse.json(
        { error: "Missing required fields: name, slug, price, stock are mandatory" },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseAdminClient()

    // Check if slug already exists
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id, slug")
      .eq("slug", slug)
      .limit(1)

    if (existingProduct && existingProduct.length > 0) {
      console.log("[POST /api/admin/products] Slug already exists, making it unique:", slug)
      // Add timestamp to make slug unique
      const timestamp = Date.now()
      slug = `${slug}-${timestamp}`
      console.log("[POST /api/admin/products] New slug:", slug)
    }

    // Log hierarchy info
    console.log("[POST /api/admin/products] Hierarchy info:")
    console.log("  - animalId:", animalId)
    console.log("  - categoryId:", categoryId)
    console.log("  - subcategoryId:", subcategoryId)
    console.log("  - brandId:", brandId)

    // Convert animalId (type string like "cat") to UUID if needed
    let animalUUID = animalId
    if (animalId && !animalId.includes('-')) {
      // It's a type string, not a UUID - convert it
      console.log("[POST /api/admin/products] Converting animal type to UUID:", animalId)
      animalUUID = await getAnimalUUID(animalId as any)
      console.log("[POST /api/admin/products] Animal UUID:", animalUUID)
      
      if (!animalUUID) {
        return NextResponse.json(
          { error: `Invalid animal type: ${animalId}` },
          { status: 400 }
        )
      }
    }

    // If subcategoryId is provided, the categoryId should be the main category
    // The subcategory should have the main category as its parent
    let finalCategoryId = categoryId
    
    if (subcategoryId) {
      // When subcategoryId is set, categoryId should already be the parent category
      console.log("[POST /api/admin/products] Using categoryId from hierarchy:", finalCategoryId)
    }

    // Create product with all hierarchy fields
    const productData = {
      name,
      slug,
      sku: sku || null,
      price: parseInt(price),
      original_price: originalPrice ? parseInt(originalPrice) : null,
      discount: discount ? parseInt(discount) : null,
      stock: parseInt(stock),
      animal_id: animalUUID || null,
      primary_animal_id: animalUUID || null,
      category_id: finalCategoryId || null,
      subcategory_id: subcategoryId || null,
      brand_id: brandId || null,
      short_description: shortDescription || null,
      description: description || null,
      tags: tags || [],
      featured: featured || false,
    }

    console.log("[POST /api/admin/products] Inserting product data:", productData)

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert([productData])
      .select()

    if (productError) {
      console.error("[POST /api/admin/products] Product creation error:", productError)
      return NextResponse.json(
        { error: productError.message || "Failed to create product" },
        { status: 500 }
      )
    }

    const productId = product?.[0]?.id
    console.log("[POST /api/admin/products] Product created with ID:", productId)

    // Create product images if provided
    if (images && images.length > 0 && productId) {
      const imageInserts = images.map((img: any) => ({
        product_id: productId,
        url: img.url,
        alt: img.alt || name,
        position: img.position || 0,
      }))

      console.log("[POST /api/admin/products] Creating", imageInserts.length, "images")

      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(imageInserts)

      if (imagesError) {
        console.error("[POST /api/admin/products] Image creation error:", imagesError)
        // Don't fail the whole request if images fail
      }
    }

    console.log("[POST /api/admin/products] Product created successfully:", product?.[0])
    return NextResponse.json(
      { data: product?.[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/admin/products] Product creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
