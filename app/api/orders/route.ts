import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      phone,
      guestEmail,
      address,
      municipality,
      city,
      wilaya,
      postalCode,
      items,
      subtotal,
      shipping,
      discount,
      total,
      paymentMethod,
      promoCode,
    } = body

    console.log("Order creation request:", { firstName, lastName, phone, guestEmail, address, municipality, city, wilaya, subtotal })

    // Validate required fields
    if (!firstName || !lastName || !phone || !address || !wilaya || subtotal === undefined) {
      console.error("Missing required fields:", { firstName, lastName, phone, address, wilaya, subtotal })
      return NextResponse.json(
        { error: `Missing required fields: ${[
          !firstName && "firstName",
          !lastName && "lastName",
          !phone && "phone",
          !address && "address",
          !wilaya && "wilaya",
          subtotal === undefined && "subtotal"
        ].filter(Boolean).join(", ")}` },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseAdminClient()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: null, // For anonymous users
          guest_email: guestEmail,
          guest_phone: phone,
          status: "pending",
          subtotal: Math.round(subtotal),
          shipping: Math.round(shipping),
          discount: Math.round(discount),
          total: Math.round(total),
          payment_method: paymentMethod,
          shipping_address: {
            firstName,
            lastName,
            phone,
            address,
            municipality,
            city,
            wilaya,
            postalCode,
            promoCode: promoCode || null,
          },
        },
      ])
      .select()

    if (orderError) {
      console.error("Order creation error:", orderError)
      console.error("Error details:", { code: orderError.code, message: orderError.message, hint: (orderError as any).hint })
      return NextResponse.json(
        { error: orderError.message || "Failed to create order" },
        { status: 500 }
      )
    }

    const orderId = order?.[0]?.id

    // Create order items
    if (items && items.length > 0 && orderId) {
      const itemInserts = items.map((item: any) => ({
        order_id: orderId,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemInserts)

      if (itemsError) {
        console.error("Order items creation error:", itemsError)
        // Don't fail the whole request if items fail
      }
    }

    // Generate order number from ID
    const orderNumber = `ORD-${orderId?.substring(0, 8).toUpperCase()}`

    return NextResponse.json(
      { 
        data: {
          id: orderId,
          orderNumber,
          ...order?.[0]
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await getSupabaseAdminClient()

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
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
