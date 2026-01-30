import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[POST /api/admin/categories] Received body:", body)

    const { name, slug, description, parentId, animalType } = body

    if (!name) {
      console.error("[POST /api/admin/categories] Missing required field: name")
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const supabase = await getSupabaseAdminClient()

    const insertData = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      description: description || "",
      parent_id: parentId || null,
      animal_type: animalType || "universal",
      image: "/pet-category.jpg",
      product_count: 0,
    }

    console.log("[POST /api/admin/categories] Inserting data:", insertData)

    const { data, error } = await supabase
      .from("categories")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("[POST /api/admin/categories] Supabase error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to create category", details: error },
        { status: 400 }
      )
    }

    console.log("[POST /api/admin/categories] Category created successfully:", data)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[POST /api/admin/categories] Unexpected error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
