import { NextResponse, NextRequest } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 })
    }

    const adminSupabase = await getSupabaseAdminClient()

    const { data: order, error } = await adminSupabase
      .from("orders")
      .select(`
        id,
        user_id,
        status,
        subtotal,
        shipping,
        discount,
        total,
        payment_method,
        tracking_number,
        notes,
        shipping_address,
        created_at,
        updated_at,
        order_items(
          id,
          product_id,
          product_name,
          product_price,
          quantity,
          products(
            id,
            slug,
            product_images(url)
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error || !order) {
      console.error("Error fetching order (admin):", error)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if current user is authenticated by looking at cookies
    let isAuthenticated = false
    let userId: string | null = null
    
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              // No-op for GET requests
            },
          },
        }
      )

      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (!authError && user) {
        isAuthenticated = true
        userId = user.id
        console.log("✅ Authenticated user:", userId)
      } else {
        console.log("❌ Not authenticated:", authError?.message)
      }
    } catch (authErr) {
      console.log("⚠️ Auth check error:", authErr instanceof Error ? authErr.message : authErr)
      // If auth check fails, user is not authenticated
      isAuthenticated = false
    }

    // ✅ If user is authenticated AND owns the order OR it's a guest order, allow viewing
    // Otherwise, require authentication
    const ownsOrder = order.user_id === userId
    const isGuestOrder = !order.user_id

    const requiresAuth = !(isAuthenticated && (ownsOrder || isGuestOrder))

    console.log(`Order ${id}: authenticated=${isAuthenticated}, ownsOrder=${ownsOrder}, isGuest=${isGuestOrder}, requiresAuth=${requiresAuth}`)

    return NextResponse.json({ 
      data: order, 
      requiresAuth,
      isGuest: !order.user_id 
    })
  } catch (err) {
    console.error("GET /api/orders/track error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 })
  }
}
