"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronRight, Package, Search, Loader, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatPrice, formatDate } from "@/lib/format"
import { createBrowserClient } from "@supabase/ssr"
import type { Order } from "@/lib/types"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  confirmed: "bg-blue-100 text-blue-800",
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [guestOrders, setGuestOrders] = useState<any[]>([])
  const [authUser, setAuthUser] = useState<any>(null)
  const [linking, setLinking] = useState(false)
  const [success, setSuccess] = useState<string>("")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Get current user
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          console.log("No authenticated user, redirecting to login")
          router.push("/login")
          return
        }

        console.log("=== ORDERS PAGE ===")
        console.log("Current user ID:", authUser.id)
        console.log("Current user email:", authUser.email)

        setAuthUser(authUser)

        // Fetch orders from API
        console.log("Fetching orders from API...")
        const response = await fetch("/api/account/orders", {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          console.error("API response not ok:", response.status)
          const errorText = await response.text()
          console.error("API error:", errorText)
          // Fallback to direct Supabase query
          throw new Error("API failed: " + errorText)
        }

        const result = await response.json()
        const ordersData = result.data || []
        
        console.log("✅ Orders fetched successfully:", ordersData.length, "orders")
        console.log("Orders data:", JSON.stringify(ordersData, null, 2))
        
        setOrders(ordersData)

        // Also check for guest orders with the same email
        const { data: guestOrdersData } = await supabase
          .from("orders")
          .select(`
            id,
            user_id,
            guest_email,
            status,
            subtotal,
            shipping,
            discount,
            total,
            payment_method,
            created_at,
            order_items(
              id,
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
          .ilike("guest_email", authUser.email || "")
          .is("user_id", null)
          .order("created_at", { ascending: false })

        if (guestOrdersData && guestOrdersData.length > 0) {
          console.log("Found", guestOrdersData.length, "guest orders with same email")
          setGuestOrders(guestOrdersData)
        }

        setLoading(false)
      } catch (err) {
        console.error("❌ Error fetching orders:", err)
        setError("Failed to load orders. Please try again.")
        setLoading(false)
      }
    }

    fetchOrders()
  }, [router])

  // Filter orders by search term
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formatDate(order.created_at).includes(searchTerm)
  )

  const handleLinkGuestOrders = async () => {
    try {
      setLinking(true)
      console.log("Linking", guestOrders.length, "guest orders to user", authUser.id)
      
      // Use API endpoint instead of direct Supabase query
      const response = await fetch("/api/account/orders/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderIds: guestOrders.map((o) => o.id),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Error linking orders:", result)
        setError(result.error || "Failed to link orders")
        setLinking(false)
        return
      }

      console.log("✅ Guest orders linked successfully!", result)
      
      // Show success message
      setSuccess(result.message)
      setError("")
      
      // Refresh the orders list
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      console.error("Error:", err)
      setError(err instanceof Error ? err.message : "Failed to link orders")
      setLinking(false)
    }
  }
  return (
    <>
      {/* Breadcrumbs */}
      <nav className="bg-secondary py-3">
        <div className="container mx-auto px-4">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li>
              <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors">
                Account
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li className="text-foreground font-medium">Orders</li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search orders..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <p className="font-semibold">✅ {success}</p>
              <p className="text-sm">Refreshing your orders...</p>
            </AlertDescription>
          </Alert>
        )}

        {guestOrders.length > 0 && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <p className="font-semibold mb-2">
                Found {guestOrders.length} previous order{guestOrders.length !== 1 ? "s" : ""} as guest
              </p>
              <p className="text-sm mb-3">
                You have orders placed before creating this account. Click the button below to link them to your account.
              </p>
              <button
                onClick={handleLinkGuestOrders}
                disabled={linking}
                className={`text-sm font-medium underline hover:no-underline text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2`}
              >
                {linking && <Loader className="h-3 w-3 animate-spin" />}
                {linking ? "Linking..." : `Link ${guestOrders.length} order${guestOrders.length !== 1 ? "s" : ""} to my account`}
              </button>
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-16">
            <Loader className="h-8 w-8 animate-spin text-primary inline-block" />
            <p className="text-muted-foreground mt-4">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {orders.length === 0 ? "No orders yet" : "No results found"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {orders.length === 0
                ? "Start shopping to see your orders here."
                : "Try a different search term."}
            </p>
            {orders.length === 0 && (
              <Link
                href="/categories"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              // Get first product image and info
              const firstItem = order.order_items?.[0]
              const productImage = firstItem?.products?.product_images?.[0]?.url || null
              const itemCount = order.order_items?.length || 0

              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block bg-card border border-border rounded-lg p-4 md:p-6 hover:border-primary transition-colors"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                      {productImage ? (
                        <Image
                          src={productImage}
                          alt={firstItem?.product_name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="flex-grow">
                      <p className="font-semibold">Order #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                      
                      {/* First Product Name */}
                      {firstItem && (
                        <p className="text-sm mt-2">
                          <span className="text-muted-foreground">Product: </span>
                          <span className="font-medium">{firstItem.product_name}</span>
                          {itemCount > 1 && <span className="text-muted-foreground"> +{itemCount - 1} more</span>}
                        </p>
                      )}
                      
                      {order.tracking_number && (
                        <p className="text-sm text-muted-foreground mt-1">Tracking: {order.tracking_number}</p>
                      )}
                    </div>

                    {/* Status & Price */}
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full capitalize ${
                          statusColors[order.status as keyof typeof statusColors]
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="font-semibold text-lg">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
