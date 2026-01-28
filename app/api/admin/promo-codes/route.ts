import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// GET: Fetch all promo codes
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching promo codes:", error)
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 })
  }
}

// POST: Create new promo code
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    console.log("Creating promo code with data:", body)

    const insertData = {
      code: body.code.toUpperCase(),
      discount_type: body.type,
      discount_value: parseFloat(body.value),
      min_order_amount: body.minOrder ? parseFloat(body.minOrder) : null,
      max_uses: body.maxUses ? parseInt(body.maxUses) : null,
      valid_from: body.validFrom,
      valid_until: body.validUntil,
      is_active: body.isActive ?? true,
    }

    console.log("Insert data:", insertData)

    const { data, error } = await supabase
      .from("promo_codes")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json({ 
        error: "Failed to create promo code", 
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }, { status: 500 })
    }

    console.log("Successfully created promo code:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error creating promo code:", error)
    return NextResponse.json({ 
      error: "Failed to create promo code", 
      message: error instanceof Error ? error.message : String(error),
      type: "unexpected_error"
    }, { status: 500 })
  }
}

// PATCH: Update promo code
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const updateData = {
      code: body.code.toUpperCase(),
      discount_type: body.type,
      discount_value: parseFloat(body.value),
      min_order_amount: body.minOrder ? parseFloat(body.minOrder) : null,
      max_uses: body.maxUses ? parseInt(body.maxUses) : null,
      valid_from: body.validFrom,
      valid_until: body.validUntil,
      is_active: body.isActive,
    }

    const { data, error } = await supabase
      .from("promo_codes")
      .update(updateData)
      .eq("id", body.id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating promo code:", error)
    return NextResponse.json({ 
      error: "Failed to update promo code",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// DELETE: Delete promo code
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Promo code ID required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("promo_codes")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting promo code:", error)
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 })
  }
}
