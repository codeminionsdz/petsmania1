import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// Get real statistics from database
async function getDashboardStats() {
  const supabase = await getSupabaseServerClient()

  // Total revenue from all orders
  const { data: orders } = await supabase
    .from("orders")
    .select("total")
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0

  // Total orders count
  const { count: ordersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })

  // Total customers (profiles with customer role)
  const { count: customersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "customer")

  // Total products in stock
  const { data: products } = await supabase
    .from("products")
    .select("stock")
  const totalStock = products?.reduce((sum, product) => sum + (product.stock || 0), 0) || 0

  return {
    revenue: totalRevenue,
    orders: ordersCount || 0,
    customers: customersCount || 0,
    stock: totalStock,
  }
}

// Get recent orders
async function getRecentOrders() {
  const supabase = await getSupabaseServerClient()

  const { data } = await supabase
    .from("orders")
    .select("id, total, status, created_at, shipping_address, guest_email, user_id, profiles(first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(5)

  return data?.map((order) => {
    const customerName = order.profiles 
      ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || order.guest_email
      : order.guest_email || "Client invité"
    
    const timeAgo = getTimeAgo(new Date(order.created_at))
    
    return {
      id: order.id.slice(0, 8).toUpperCase(),
      customer: customerName,
      total: order.total,
      status: order.status,
      date: timeAgo,
    }
  }) || []
}

// Get top selling products
async function getTopProducts() {
  const supabase = await getSupabaseServerClient()

  const { data } = await supabase
    .from("order_items")
    .select("product_id, product_name, product_price, quantity")

  if (!data) return []

  // Group by product and calculate totals
  const productStats = data.reduce((acc: any, item) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = {
        id: item.product_id,
        name: item.product_name,
        sales: 0,
        revenue: 0,
      }
    }
    acc[item.product_id].sales += item.quantity
    acc[item.product_id].revenue += item.product_price * item.quantity
    return acc
  }, {})

  // Convert to array and sort by revenue
  return Object.values(productStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5)
}

// Helper function to calculate time ago
function getTimeAgo(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels = {
  pending: "En attente",
  processing: "En cours",
  shipped: "Expédié",
  delivered: "Livré",
  cancelled: "Annulé",
}

export default async function AdminDashboardPage() {
  // Fetch real data from database
  const stats = await getDashboardStats()
  const recentOrders = await getRecentOrders()
  const topProducts = await getTopProducts()

  const statsCards = [
    {
      title: "Chiffre d'affaires",
      value: formatPrice(stats.revenue),
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Commandes",
      value: stats.orders.toString(),
      change: "+8.2%",
      trend: "up" as const,
      icon: ShoppingCart,
    },
    {
      title: "Clients",
      value: stats.customers.toString(),
      change: "+15.3%",
      trend: "up" as const,
      icon: Users,
    },
    {
      title: "Produits en stock",
      value: stats.stock.toString(),
      change: stats.stock > 0 ? "+2.1%" : "0%",
      trend: stats.stock > 0 ? ("up" as const) : ("down" as const),
      icon: Package,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue ! Voici un aperçu de votre boutique.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Commandes récentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer} • {order.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}
                    >
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Produits populaires</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/products">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} ventes</p>
                  </div>
                  <p className="font-medium">{formatPrice(product.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
