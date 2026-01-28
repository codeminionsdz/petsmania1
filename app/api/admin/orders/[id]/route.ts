import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params
    const supabase = await getSupabaseAdminClient()

    console.log("API: Fetching order with ID:", orderId)

    const { data: order, error } = await supabase
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
      console.error("Supabase error fetching order:", error)
      return NextResponse.json({ error: `Order not found: ${error.message}` }, { status: 404 })
    }

    if (!order) {
      console.error("Order is null")
      return NextResponse.json({ error: "Order data is null" }, { status: 404 })
    }

    console.log("API: Order found:", order.id)
    console.log("API: order_items data:", JSON.stringify(order.order_items, null, 2))

    // Get wilaya name if wilaya ID is present
    const shippingAddr = order.shipping_address as any
    let wilayaName = shippingAddr?.wilaya || shippingAddr?.wilaya_id || ""

    if (shippingAddr?.wilaya || shippingAddr?.wilaya_id) {
      // Try to get wilaya name from database
      const wilayaId = shippingAddr.wilaya_id || shippingAddr.wilaya
      const { data: wilayaData } = await supabase
        .from("wilayas")
        .select("name")
        .eq("id", wilayaId)
        .single()

      if (wilayaData?.name) {
        wilayaName = wilayaData.name
      }
    }

    // Transform the data to match the frontend interface
    const items = (order.order_items || []).map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      productPrice: item.product_price,
      quantity: item.quantity,
    }))
    console.log("API: Transformed items:", JSON.stringify(items, null, 2))

    const transformedOrder = {
      id: `ORD-${order.id.substring(0, 8).toUpperCase()}`,
      createdAt: order.created_at,
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      paymentMethod: order.payment_method,
      trackingNumber: order.tracking_number,
      notes: order.notes,
      shippingAddress: {
        firstName: shippingAddr?.firstName || "",
        lastName: shippingAddr?.lastName || "",
        address: shippingAddr?.address || "",
        city: shippingAddr?.city || "",
        wilaya: wilayaName,
        phone: shippingAddr?.phone || "",
        email: shippingAddr?.email || "",
      },
      items,
      userId: order.user_id,
      guestEmail: order.guest_email,
      guestPhone: order.guest_phone,
    }

    console.log("API: Returning transformed order:", transformedOrder)
    return NextResponse.json(transformedOrder)
  } catch (error) {
    console.error("Error in GET /api/admin/orders/[id]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params
    const supabase = await getSupabaseAdminClient()
    const { status, trackingNumber, notes } = await request.json()

    const updates: any = {}
    if (status) updates.status = status
    if (trackingNumber) updates.tracking_number = trackingNumber
    if (notes !== undefined) updates.notes = notes

    const { data: order, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId)
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
      .single()

    if (error) {
      console.error("Error updating order:", error)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // Transform the response to match the frontend interface
    const shippingAddr = order.shipping_address as any
    const items = (order.order_items || []).map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      productPrice: item.product_price,
      quantity: item.quantity,
    }))

    const transformedOrder = {
      id: `ORD-${order.id.substring(0, 8).toUpperCase()}`,
      createdAt: order.created_at,
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      paymentMethod: order.payment_method,
      trackingNumber: order.tracking_number,
      notes: order.notes,
      shippingAddress: {
        firstName: shippingAddr?.firstName || "",
        lastName: shippingAddr?.lastName || "",
        address: shippingAddr?.address || "",
        city: shippingAddr?.city || "",
        wilaya: shippingAddr?.wilaya || "",
        phone: shippingAddr?.phone || "",
        email: shippingAddr?.email || "",
      },
      items,
      userId: order.user_id,
      guestEmail: order.guest_email,
      guestPhone: order.guest_phone,
    }

    return NextResponse.json(transformedOrder)
  } catch (error) {
    console.error("Error in PATCH /api/admin/orders/[id]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
