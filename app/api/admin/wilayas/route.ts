import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

// GET: Fetch all wilayas
export async function GET() {
  try {
    const supabase = await getSupabaseAdminClient()
    
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
    const supabase = await getSupabaseAdminClient()
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
    const supabase = await getSupabaseAdminClient()
    const body = await request.json()

    console.log('[PATCH /api/admin/wilayas] Request body:', JSON.stringify(body))

    if (!body.id) {
      console.error('[PATCH /api/admin/wilayas] Missing wilaya ID')
      return NextResponse.json({ error: "Wilaya ID is required" }, { status: 400 })
    }

    console.log('[PATCH /api/admin/wilayas] Updating wilaya with ID:', body.id)

    // First, verify the wilaya exists
    const { data: existingWilaya } = await supabase
      .from("wilayas")
      .select("id, name, code")
      .eq("id", body.id)
      .single()

    if (!existingWilaya) {
      console.error('[PATCH /api/admin/wilayas] Wilaya not found with ID:', body.id)
      return NextResponse.json({ error: "Wilaya not found" }, { status: 404 })
    }

    console.log('[PATCH /api/admin/wilayas] Found existing wilaya:', existingWilaya)

    const updateData = {
      name: body.name,
      shipping_cost: parseInt(body.shipping_cost) || 0,
      delivery_days: parseInt(body.delivery_days) || 1,
      is_active: body.is_active === true || body.is_active === 'true',
    }

    // Only update code if it changed
    if (body.code && body.code !== existingWilaya.code) {
      updateData.code = body.code
    }

    console.log('[PATCH /api/admin/wilayas] Update payload:', JSON.stringify(updateData))

    const { data, error } = await supabase
      .from("wilayas")
      .update(updateData)
      .eq("id", body.id)
      .select()

    if (error) {
      console.error('[PATCH /api/admin/wilayas] Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      throw error
    }

    if (!data || data.length === 0) {
      console.error('[PATCH /api/admin/wilayas] No rows returned after update')
      return NextResponse.json({ error: "Update failed - no data returned" }, { status: 500 })
    }

    console.log('[PATCH /api/admin/wilayas] ✅ Wilaya updated successfully:', data[0])
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("[PATCH /api/admin/wilayas] Exception:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Failed to update wilaya", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

// DELETE: Delete wilaya
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseAdminClient()
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
