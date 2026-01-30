import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("[PUT /api/admin/categories/[id]] Updating category ID:", id)

    const body = await request.json()
    console.log("[PUT /api/admin/categories/[id]] Received body:", body)

    const { name, slug, description, parentId, animalType } = body

    if (!name) {
      console.error("[PUT /api/admin/categories/[id]] Missing required field: name")
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()

    const updateData = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      description: description || "",
      parent_id: parentId || null,
      animal_type: animalType || "universal",
      updated_at: new Date().toISOString(),
    }

    console.log("[PUT /api/admin/categories/[id]] Updating with data:", updateData)

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[PUT /api/admin/categories/[id]] Supabase error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to update category", details: error },
        { status: 400 }
      )
    }

    console.log("[PUT /api/admin/categories/[id]] Category updated successfully:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[PUT /api/admin/categories/[id]] Unexpected error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("[DELETE /api/admin/categories/[id]] Deleting category ID:", id)

    const supabase = await getSupabaseAdminClient()

    // First delete all subcategories
    console.log("[DELETE /api/admin/categories/[id]] Deleting subcategories...")
    const { error: deleteSubError } = await supabase.from("categories").delete().eq("parent_id", id)
    if (deleteSubError) {
      console.warn("[DELETE /api/admin/categories/[id]] Error deleting subcategories:", deleteSubError)
    }

    // Then delete the category itself
    console.log("[DELETE /api/admin/categories/[id]] Deleting category...")
    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      console.error("[DELETE /api/admin/categories/[id]] Supabase error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to delete category", details: error },
        { status: 400 }
      )
    }

    console.log("[DELETE /api/admin/categories/[id]] Category deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/admin/categories/[id]] Unexpected error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
