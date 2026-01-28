import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Link guest orders to a newly registered user
 * This endpoint uses admin client to bypass RLS policies
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user from their session FIRST (using server client)
    const serverSupabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Now use admin client for updates (to bypass RLS)
    const supabase = await getSupabaseAdminClient()

    const body = await request.json()
    const { phone, orderId } = body

    console.log(`[LINK-GUEST-ORDERS] Linking guest orders for user ${user.id}`)
    console.log(`[LINK-GUEST-ORDERS] Phone: ${phone}, OrderId: ${orderId}`)

    // If specific orderId provided, link that first
    if (orderId) {
      console.log(`[LINK-GUEST-ORDERS] Linking specific order: ${orderId}`)
      const { error: idError, count } = await supabase
        .from("orders")
        .update({ user_id: user.id })
        .eq("id", orderId)
        .is("user_id", null)

      if (idError) {
        console.warn(`[LINK-GUEST-ORDERS] Failed to link order by ID:`, idError)
      } else {
        console.log(`[LINK-GUEST-ORDERS] Linked ${count} order(s) by ID`)
      }
    }

    // Link all guest orders matching the phone number
    if (phone) {
      console.log(`[LINK-GUEST-ORDERS] Linking guest orders with phone: ${phone}`)
      const { error: phoneError, count } = await supabase
        .from("orders")
        .update({ user_id: user.id })
        .eq("guest_phone", phone)
        .is("user_id", null)

      if (phoneError) {
        console.warn(`[LINK-GUEST-ORDERS] Failed to link orders by phone:`, phoneError)
      } else {
        console.log(`[LINK-GUEST-ORDERS] Linked ${count} guest order(s) by phone`)
      }
    }

    // Create address from the first linked order
    const { data: linkedOrders } = await supabase
      .from("orders")
      .select("id, shipping_address")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)

    if (linkedOrders && linkedOrders.length > 0) {
      const order = linkedOrders[0]
      if (order.shipping_address) {
        const addr = order.shipping_address
        const { error: addressError } = await supabase
          .from("addresses")
          .insert([
            {
              user_id: user.id,
              first_name: addr.firstName || addr.first_name || "",
              last_name: addr.lastName || addr.last_name || "",
              phone: addr.phone || phone || "",
              email: addr.email || "",
              address: addr.address || "",
              city: addr.city || "",
              wilaya_id: null,
              postal_code: addr.postalCode || addr.postal_code || "",
              is_default: true,
            },
          ])

        if (addressError) {
          console.warn(`[LINK-GUEST-ORDERS] Failed to create address:`, addressError)
        } else {
          console.log(`[LINK-GUEST-ORDERS] Address created successfully`)
        }
      }
    }

    console.log(`[LINK-GUEST-ORDERS] Completed linking for user ${user.id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[LINK-GUEST-ORDERS] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
