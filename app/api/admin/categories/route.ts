import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { name, slug, description, parentId } = body

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
        description,
        parent_id: parentId,
        image: "/pharmacy-category.jpg",
        product_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating category:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/admin/categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
