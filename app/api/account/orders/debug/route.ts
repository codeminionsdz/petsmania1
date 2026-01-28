import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    const debug: any = {
      timestamp: new Date().toISOString(),
    }

    if (userError || !user) {
      debug.user = "No authenticated user"
      return NextResponse.json(debug)
    }

    debug.user_id = user.id
    debug.user_email = user.email

    // Get all orders for debugging
    const { data: allOrders, error: allOrdersError } = await supabase
      .from("orders")
      .select("id, user_id, guest_email, status, created_at")
      .order("created_at", { ascending: false })

    debug.all_orders_error = allOrdersError
    debug.all_orders_count = allOrders?.length || 0
    debug.all_orders_sample = allOrders?.slice(0, 5)

    // Get user's orders
    const { data: userOrders, error: userOrdersError } = await supabase
      .from("orders")
      .select("id, user_id, guest_email, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    debug.user_orders_error = userOrdersError
    debug.user_orders_count = userOrders?.length || 0
    debug.user_orders = userOrders

    // Get guest orders with this email
    const { data: guestOrders, error: guestOrdersError } = await supabase
      .from("orders")
      .select("id, user_id, guest_email, status, created_at")
      .ilike("guest_email", user.email || "")
      .order("created_at", { ascending: false })

    debug.guest_orders_error = guestOrdersError
    debug.guest_orders_count = guestOrders?.length || 0
    debug.guest_orders = guestOrders

    return NextResponse.json(debug, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
