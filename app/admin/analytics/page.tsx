import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrice } from "@/lib/format"
import { getSupabaseServerClient } from "@/lib/supabase/server"

async function getAnalyticsData() {
  const supabase = await getSupabaseServerClient()

  // Get total revenue
  const { data: orders } = await supabase.from("orders").select("total")
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0
  
  // Get total orders count
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
  
  // Get new customers (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { count: newCustomers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo.toISOString())
    .eq("role", "customer")

  // Get top categories by revenue
  const { data: orderItems } = await supabase
    .from("order_items")
    .select(`
      product_id,
      product_price,
      quantity,
      products(category_id, categories(id, name))
    `)

  const categoryStats: Record<string, { revenue: number; orders: number; name: string }> = {}
  
  orderItems?.forEach((item: any) => {
    const category = item.products?.categories
    if (category) {
      if (!categoryStats[category.id]) {
        categoryStats[category.id] = { revenue: 0, orders: 0, name: category.name }
      }
      categoryStats[category.id].revenue += item.product_price * item.quantity
      categoryStats[category.id].orders += item.quantity
    }
  })

  const topCategories = Object.values(categoryStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map((cat) => ({
      name: cat.name,
      revenue: cat.revenue,
      orders: cat.orders,
      percentage: totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0,
    }))

  // Get top wilayas (from shipping addresses)
  const { data: ordersWithAddress } = await supabase
    .from("orders")
    .select("shipping_address, total")

  const wilayaStats: Record<string, { orders: number; revenue: number }> = {}
  
  ordersWithAddress?.forEach((order) => {
    const address = order.shipping_address as any
    const city = address?.city || "Unknown"
    if (!wilayaStats[city]) {
      wilayaStats[city] = { orders: 0, revenue: 0 }
    }
    wilayaStats[city].orders += 1
    wilayaStats[city].revenue += order.total
  })

  const topWilayas = Object.entries(wilayaStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    totalRevenue,
    totalOrders: totalOrders || 0,
    newCustomers: newCustomers || 0,
    topCategories,
    topWilayas,
  }
}

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalyticsData()

  const overviewStats = [
    { 
      title: "Total Revenue", 
      value: formatPrice(analytics.totalRevenue), 
      change: "+12.5%", 
      icon: DollarSign 
    },
    { 
      title: "Total Orders", 
      value: analytics.totalOrders.toString(), 
      change: "+8.2%", 
      icon: ShoppingCart 
    },
    { 
      title: "New Customers", 
      value: analytics.newCustomers.toString(), 
      change: "+23.1%", 
      icon: Users 
    },
    { 
      title: "Conversion Rate", 
      value: "3.2%", 
      change: "+0.8%", 
      icon: TrendingUp 
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your store performance and insights</p>
        </div>
        <Select defaultValue="30d">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
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
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCategories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">{formatPrice(category.revenue)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${category.percentage}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-10">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Wilayas */}
        <Card>
          <CardHeader>
            <CardTitle>Top Regions (Wilayas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topWilayas.map((wilaya, index) => (
                <div key={wilaya.name} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{wilaya.name}</p>
                    <p className="text-sm text-muted-foreground">{wilaya.orders} orders</p>
                  </div>
                  <p className="font-medium">{formatPrice(wilaya.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
