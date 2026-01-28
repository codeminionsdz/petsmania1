import { NextResponse, NextRequest } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  console.log("GET /api/admin/products/[id] - Fetching product:", id)

  try {
    const supabase = await getSupabaseAdminClient()

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories(name, id, parent_id),
        brands(name, id),
        product_images(id, url, alt, position)
      `)
      .eq("id", id)
      .single()

    if (error || !data) {
      console.error("Product fetch error:", error)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Transform to match frontend Product type
    const product = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      shortDescription: data.short_description || "",
      price: data.price,
      originalPrice: data.original_price,
      discount: data.discount,
      images: data.product_images?.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        position: img.position,
      })) || [],
      categoryId: data.category_id,
      categoryName: data.categories?.name || "",
      brandId: data.brand_id,
      brandName: data.brands?.name || "",
      stock: data.stock,
      sku: data.sku,
      featured: data.featured,
      tags: data.tags || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return NextResponse.json(product, { status: 200 })
  } catch (error) {
    console.error("Error in GET /api/admin/products/[id]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  console.log("PUT /api/admin/products/[id] - Updating product:", id)

  try {
    const body = await request.json()
    const { name, slug, sku, price, originalPrice, discount, stock, categoryId, brandId, shortDescription, description, tags, featured, imagesToDelete } = body

    const supabase = await getSupabaseAdminClient()

    // Update product
    const { data: product, error: productError } = await supabase
      .from("products")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (productError) {
      console.error("Product update error:", productError)
      return NextResponse.json(
        { error: productError.message || "Failed to update product" },
        { status: 500 }
      )
    }

    // Delete images if specified
    if (imagesToDelete && imagesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("product_images")
        .delete()
        .in("id", imagesToDelete)

      if (deleteError) {
        console.error("Image deletion error:", deleteError)
        // Continue anyway, don't fail the whole update
      }
    }

    return NextResponse.json(product?.[0], { status: 200 })
  } catch (error) {
    console.error("Error in PUT /api/admin/products/[id]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  console.log("DELETE /api/admin/products/[id] - Deleting product:", id)

  try {
    const supabase = await getSupabaseAdminClient()

    // Delete product images first (with CASCADE, but doing it explicitly for safety)
    const { error: imagesError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", id)

    if (imagesError) {
      console.error("Delete product images error:", imagesError)
      return NextResponse.json({ error: `Failed to delete images: ${imagesError.message}` }, { status: 500 })
    }

    // Delete related cart items
    const { error: cartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("product_id", id)

    if (cartError) {
      console.error("Delete cart items error:", cartError)
      return NextResponse.json({ error: `Failed to delete cart items: ${cartError.message}` }, { status: 500 })
    }

    // Delete related wishlist items
    const { error: wishlistError } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("product_id", id)

    if (wishlistError) {
      console.error("Delete wishlist items error:", wishlistError)
      return NextResponse.json({ error: `Failed to delete wishlist items: ${wishlistError.message}` }, { status: 500 })
    }

    // Delete the product itself
    const { error: productError } = await supabase
      .from("products")
      .delete()
      .eq("id", id)

    if (productError) {
      console.error("Delete product error:", productError)
      return NextResponse.json({ error: `Failed to delete product: ${productError.message}` }, { status: 500 })
    }

    console.log("Product deleted successfully:", id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/admin/products:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
