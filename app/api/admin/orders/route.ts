import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseAdminClient()

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        total,
        status,
        payment_method,
        created_at,
        shipping_address,
        order_items(id),
        user_id,
        guest_email,
        guest_phone,
        subtotal,
        shipping,
        discount,
        tracking_number,
        notes
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: orders })
  } catch (error) {
    console.error("Error in GET /api/admin/orders:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
