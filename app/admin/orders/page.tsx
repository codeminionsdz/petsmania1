import { OrdersPageContent } from "@/components/admin/orders-page-content"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

async function getOrders() {
  const supabase = await getSupabaseAdminClient()

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(`
      id,
      total,
      status,
      payment_method,
      created_at,
      shipping_address,
      order_items(id)
    `)
    .order("created_at", { ascending: false })

  if (ordersError) {
    console.error("Error fetching orders:", ordersError)
    return []
  }

  if (!orders || orders.length === 0) {
    console.log("No orders found in database")
    return []
  }

  return orders.map((order: any) => {
    const shippingAddr = order.shipping_address as any
    const customerName = shippingAddr 
      ? `${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`.trim()
      : "Guest"
    
    const itemCount = Array.isArray(order.order_items) ? order.order_items.length : 0
    
    return {
      uuid: order.id,
      id: `ORD-${order.id.substring(0, 8).toUpperCase()}`,
      customer: customerName || "Guest",
      email: shippingAddr?.email || "",
      phone: shippingAddr?.phone || "",
      items: itemCount,
      total: order.total,
      status: order.status,
      paymentMethod: order.payment_method,
      createdAt: order.created_at,
    }
  })
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return <OrdersPageContent initialOrders={orders} />
}
