import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET: Fetch all wilayas
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from("wilayas")
      .select("*")
      .order("code")

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching wilayas:", error)
    return NextResponse.json({ error: "Failed to fetch wilayas" }, { status: 500 })
  }
}

// POST: Create new wilaya
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("wilayas")
      .insert({
        code: body.code,
        name: body.name,
        shipping_cost: body.shipping_cost,
        delivery_days: body.delivery_days,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating wilaya:", error)
    return NextResponse.json({ error: "Failed to create wilaya" }, { status: 500 })
  }
}

// PATCH: Update wilaya
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("wilayas")
      .update({
        name: body.name,
        shipping_cost: body.shipping_cost,
        delivery_days: body.delivery_days,
        is_active: body.is_active,
      })
      .eq("id", body.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating wilaya:", error)
    return NextResponse.json({ error: "Failed to update wilaya" }, { status: 500 })
  }
}

// DELETE: Delete wilaya
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Wilaya ID required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("wilayas")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting wilaya:", error)
    return NextResponse.json({ error: "Failed to delete wilaya" }, { status: 500 })
  }
}
