import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    // Get current user from their session (using server client, not admin)
    const serverSupabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await serverSupabase.auth.getUser()

    if (!user) {
      console.log("No user found in auth")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log(`API: Fetching orders for authenticated user ${user.id}`)

    // Use admin client to fetch orders (to bypass RLS for guest orders)
    const adminSupabase = await getSupabaseAdminClient()
    const email = request.nextUrl.searchParams.get("email")
    const orderId = request.nextUrl.searchParams.get("id")

    // If looking for a specific order by ID
    if (orderId) {
      console.log("Fetching order by ID:", orderId)
      const { data: order, error } = await adminSupabase
        .from("orders")
        .select(`
          id,
          user_id,
          guest_email,
          guest_phone,
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
            quantity
          )
        `)
        .eq("id", orderId)
        .single()

      if (error) {
        console.error("Error fetching order:", error)
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      if (!order) {
        console.log("Order not found for ID:", orderId)
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      // Authorization check: user must own the order or be the guest
      // First check: does user own this order?
      const userOwnsOrder = order.user_id === user.id
      console.log(`Order check - userOwnsOrder: ${userOwnsOrder}, order.user_id: ${order.user_id}, user.id: ${user.id}`)
      
      if (userOwnsOrder) {
        console.log("Order found and authorized (owned by user):", order.id)
        return NextResponse.json(order)
      }

      // Second check: is this a guest order that belongs to the authenticated user?
      // (i.e., the user linked their account to a guest checkout)
      console.log(`Checking guest order - guest_phone: ${order.guest_phone}`)
      
      if (order.guest_phone) {
        // Get user's profile to check for phone match
        const { data: profile, error: profileError } = await adminSupabase
          .from("profiles")
          .select("email, phone")
          .eq("id", user.id)
          .single()

        console.log(`Profile query result - error: ${profileError}, profile: ${profile ? 'found' : 'not found'}`)
        
        if (profile) {
          let userPhone = profile.phone
          console.log(`Initial userPhone from profile: ${userPhone}`)
          
          // If phone field is empty, try to extract from email
          if (!userPhone && profile.email) {
            const phoneMatch = profile.email.match(/phone-([^@]+)@/)
            if (phoneMatch) {
              userPhone = phoneMatch[1]
              console.log(`Extracted userPhone from email: ${userPhone}`)
            }
          }
          
          // Normalize both phones for comparison (remove spaces, dashes, parentheses)
          const normalizePhone = (phone: string | null | undefined) => {
            if (!phone) return ""
            return phone.toString().replace(/[\s\-\(\)]/g, '')
          }
          
          const normalizedUserPhone = normalizePhone(userPhone)
          const normalizedGuestPhone = normalizePhone(order.guest_phone)
          const userIsGuest = normalizedUserPhone === normalizedGuestPhone && normalizedUserPhone !== ""
          console.log(`Order auth check: userPhone="${userPhone}" (normalized: "${normalizedUserPhone}"), guest_phone="${order.guest_phone}" (normalized: "${normalizedGuestPhone}"), match=${userIsGuest}`)
          
          if (userIsGuest) {
            console.log("Order found and authorized (guest order for user):", order.id)
            return NextResponse.json(order)
          }
        } else {
          console.log(`No profile found for user ${user.id}, profileError:`, profileError?.message)
        }
      }

      console.log("Unauthorized access attempt to order:", orderId)
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // If looking for orders by email (guest orders)
    if (email) {
      console.log("Fetching guest orders for email:", email)
      // Normalize email for comparison
      const normalizedEmail = email.toLowerCase().trim()
      console.log("Normalized email:", normalizedEmail)
      
      const { data: orders, error } = await adminSupabase
        .from("orders")
        .select(`
          id,
          user_id,
          guest_email,
          guest_phone,
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
          order_items(id)
        `)
        .ilike("guest_email", normalizedEmail)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching orders by email:", error)
        return NextResponse.json({ data: [] })
      }

      console.log("Guest orders found:", orders?.length || 0)
      if (orders && orders.length > 0) {
        console.log("Order emails:", orders.map(o => o.guest_email))
      }
      return NextResponse.json({ data: orders || [] })
    }

    // Get current user's orders (user already verified above)
    // First, fetch authenticated user's own orders
    let { data: orders, error } = await adminSupabase
      .from("orders")
      .select(`
        id,
        user_id,
        guest_email,
        guest_phone,
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
          products!left(
            id,
            slug,
            product_images(url)
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Get the user's phone from profile for fallback linking
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("phone, email")
      .eq("id", user.id)
      .single()

    console.log(`API: User profile - phone: ${profile?.phone}, email: ${profile?.email}`)

    let linkedOrders = orders || []
    
    // Extract phone from email if phone is not set (format: phone-XXXXXXXXXX@petsmania.local)
    let userPhone = profile?.phone
    if (!userPhone && profile?.email) {
      const phoneMatch = profile.email.match(/phone-([^@]+)@/)
      if (phoneMatch) {
        userPhone = phoneMatch[1]
        console.log(`API: Extracted phone from email: ${userPhone}`)
      }
    }
    
    // Helper function to normalize phones
    const normalizePhone = (phone: string | null | undefined) => {
      if (!phone) return ""
      return phone.toString().replace(/[\s\-\(\)]/g, '')
    }
    
    const normalizedUserPhone = normalizePhone(userPhone)
    
    if (normalizedUserPhone) {
      console.log(`API: Using user phone for guest order search: "${userPhone}" (normalized: "${normalizedUserPhone}")`)
    } else {
      console.log(`API: No phone available for guest order matching`)
    }

    // If user has a phone number, also fetch guest orders with same phone
    if (normalizedUserPhone) {
      console.log(`API: Searching for guest orders with phone ${userPhone}`)
      
      // First try exact match
      let { data: guestOrders } = await adminSupabase
        .from("orders")
        .select(`
          id,
          user_id,
          guest_email,
          guest_phone,
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
            products!left(
              id,
              slug,
              product_images(url)
            )
          )
        `)
        .eq("guest_phone", userPhone)
        .order("created_at", { ascending: false })
      
      // If no exact match, try case-insensitive match
      if (!guestOrders || guestOrders.length === 0) {
        console.log(`No exact guest_phone match for ${userPhone}, trying all guest orders...`)
        const { data: allGuestOrders } = await adminSupabase
          .from("orders")
          .select(`
            id,
            user_id,
            guest_email,
            guest_phone,
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
              products!left(
                id,
                slug,
                product_images(url)
              )
            )
          `)
          .is("user_id", null)
          .order("created_at", { ascending: false })
        
        // Filter in code to handle formatting differences
        guestOrders = allGuestOrders?.filter(order => {
          if (!order.guest_phone) return false
          // Normalize both for comparison (remove spaces, dashes, etc)
          const normalizedOrderPhone = order.guest_phone.replace(/[\s\-\(\)]/g, '')
          const match = normalizedOrderPhone === normalizedUserPhone
          if (match) {
            console.log(`Matched guest phone (after normalization): ${order.guest_phone} === ${userPhone}`)
          }
          return match
        }) || []
      }

      if (guestOrders && guestOrders.length > 0) {
        console.log(`API: Found ${guestOrders.length} guest orders with phone ${userPhone}`)
        // Combine and remove duplicates
        const linkedIds = linkedOrders.map(o => o.id)
        const newGuestOrders = guestOrders.filter(go => !linkedIds.includes(go.id))
        linkedOrders = [...linkedOrders, ...newGuestOrders]
      }
    }

    // If still no orders and we don't have a phone, try matching by email
    if ((!linkedOrders || linkedOrders.length === 0) && profile?.email && !normalizedUserPhone) {
      const { data: emailOrders } = await adminSupabase
        .from("orders")
        .select(`
          id,
          user_id,
          guest_email,
          guest_phone,
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
            products!left(
              id,
              slug,
              product_images(url)
            )
          )
        `)
        .ilike("guest_email", profile.email)
        .is("user_id", null)
        .order("created_at", { ascending: false })

      if (emailOrders && emailOrders.length > 0) {
        console.log(`Found ${emailOrders.length} guest orders with email ${profile.email}`)
        linkedOrders = [...linkedOrders, ...emailOrders]
      }
    }

    if (error && linkedOrders.length === 0) {
      console.error("Error fetching user orders:", error)
      console.error("Error details:", error.message, error.details)
      return NextResponse.json(
        { error: error.message, data: [] },
        { status: 500 }
      )
    }

    // Remove duplicates and sort
    const uniqueOrders = Array.from(
      new Map(linkedOrders.map(o => [o.id, o])).values()
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    console.log(`API: Found ${uniqueOrders.length} total orders (user + guest)`)
    return NextResponse.json({ data: uniqueOrders })
  } catch (error) {
    console.error("Error in GET /api/account/orders:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
