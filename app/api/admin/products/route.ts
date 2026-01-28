import { NextResponse, NextRequest } from "next/server"
import { getProducts } from "@/lib/data"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

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
    const { name, slug, sku, price, originalPrice, discount, stock, categoryId, brandId, shortDescription, description, tags, featured, images } = body

    // Validate required fields
    if (!name || !slug || !price || !stock || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseAdminClient()

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert([
        {
          name,
          slug,
          sku: sku || null,
          price: parseInt(price),
          original_price: originalPrice ? parseInt(originalPrice) : null,
          discount: discount ? parseInt(discount) : null,
          stock: parseInt(stock),
          category_id: categoryId,
          brand_id: brandId || null,
          short_description: shortDescription || null,
          description: description || null,
          tags: tags || [],
          featured: featured || false,
        },
      ])
      .select()

    if (productError) {
      console.error("Product creation error:", productError)
      return NextResponse.json(
        { error: productError.message || "Failed to create product" },
        { status: 500 }
      )
    }

    const productId = product?.[0]?.id

    // Create product images if provided
    if (images && images.length > 0 && productId) {
      const imageInserts = images.map((img: any) => ({
        product_id: productId,
        url: img.url,
        alt: img.alt || name,
        position: img.position || 0,
      }))

      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(imageInserts)

      if (imagesError) {
        console.error("Image creation error:", imagesError)
        // Don't fail the whole request if images fail
      }
    }

    return NextResponse.json(
      { data: product?.[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
