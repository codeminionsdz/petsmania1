"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Package, Truck, MapPin, Phone, Mail, Loader, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
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

const statusSteps = {
  pending: 1,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: 0,
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [error, setError] = useState<string>("")
  const [wilayas, setWilayas] = useState<any[]>([])

  useEffect(() => {
    // Load wilayas on mount
    const loadWilayas = async () => {
      try {
        const res = await fetch('/api/wilayas')
        const data = await res.json()
        if (data.success) {
          setWilayas(data.data)
        }
      } catch (err) {
        console.error('Error loading wilayas:', err)
      }
    }
    loadWilayas()
  }, [])

  useEffect(() => {
    if (!id) return

    const fetchOrder = async () => {
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

        // If user is not authenticated, set a state to show login prompt
        if (authError || !authUser) {
          setNeedsAuth(true)
          setLoading(false)
          return
        }

        // Fetch order details from API endpoint
        // The API handles authorization - checking if user owns order or guest phone matches
        const response = await fetch(`/api/account/orders?id=${id}`, {
          credentials: "include",
        })

        if (!response.ok) {
          if (response.status === 401) {
            setNeedsAuth(true)
          } else {
            setNotFound(true)
          }
          setLoading(false)
          return
        }

        const orderData = await response.json()

        if (!orderData) {
          setNotFound(true)
          setLoading(false)
          return
        }

        console.log("Order fetched:", orderData)
        setOrder(orderData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching order:", err)
        setError("Failed to load order")
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <Loader className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const getWilayaName = (wilayaId: string) => {
    if (!wilayaId) return ''
    const wilaya = wilayas.find(w => w.id === wilayaId)
    return wilaya?.name || wilayaId
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-4">Error Loading Order</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/account/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (notFound || !order) {
    // If user needs to authenticate
    if (needsAuth) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h1 className="text-2xl font-bold mb-4">يتطلب تسجيل دخول</h1>
            <p className="text-muted-foreground mb-6">لتتبع طلباتك، يرجى تسجيل الدخول أو إنشاء حساب جديد.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/register">إنشاء حساب</Link>
              </Button>
            </div>
            <Button asChild variant="ghost" className="w-full mt-4">
              <Link href="/track-order">تتبع بدون حساب</Link>
            </Button>
          </div>
        </div>
      )
    }

    // If order not found
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">الطلب غير موجود</h1>
          <p className="text-muted-foreground mb-6">الطلب الذي تبحث عنه غير موجود.</p>
          <Button asChild>
            <Link href="/account/orders">العودة إلى الطلبات</Link>
          </Button>
        </div>
      </div>
    )
  }

  const currentStep = statusSteps[order.status as keyof typeof statusSteps] || 0

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
            <li>
              <Link href="/account/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                Orders
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li className="text-foreground font-medium">{order.id}</li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Order Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{order.id}</h1>
              <p className="text-muted-foreground mt-2">Placed on {formatDate(order.created_at)}</p>
            </div>
            <span className={`inline-block px-4 py-2 text-sm font-medium rounded-full capitalize ${
              statusColors[order.status as keyof typeof statusColors]
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Order Items Section */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-6">Order Items</h2>
              
              <div className="space-y-4">
                {order.order_items.map((item: any, index: number) => {
                  const productImage = item.products?.product_images?.[0]?.url || null
                  const productSlug = item.products?.slug || ""

                  return (
                    <div 
                      key={item.id || index} 
                      className="flex gap-4 p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
                        {productImage ? (
                          <Image
                            src={productImage}
                            alt={item.product_name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow">
                        <Link 
                          href={`/products/${productSlug}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {item.product_name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          Quantity: <span className="font-medium">{item.quantity}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Price per unit: <span className="font-medium">{formatPrice(item.product_price)}</span>
                        </p>
                      </div>

                      {/* Subtotal */}
                      <div className="flex flex-col items-end justify-center">
                        <p className="text-sm text-muted-foreground">Subtotal</p>
                        <p className="text-lg font-semibold">
                          {formatPrice(item.product_price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Timeline */}
          <div className="md:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-8">Order Timeline</h2>

              <div className="space-y-8">
                {/* Step 1: Order Placed */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      ✓
                    </div>
                    {currentStep > 1 && <div className="w-0.5 h-12 bg-primary mt-2"></div>}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold">Order Placed</h3>
                    <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                  </div>
                </div>

                {/* Step 2: Processing */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      ✓
                    </div>
                    {currentStep > 2 && <div className="w-0.5 h-12 bg-primary mt-2"></div>}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold">Processing</h3>
                    <p className="text-sm text-muted-foreground">We're preparing your order</p>
                  </div>
                </div>

                {/* Step 3: Shipped */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      ✓
                    </div>
                    {currentStep > 3 && <div className="w-0.5 h-12 bg-primary mt-2"></div>}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold">Shipped</h3>
                    <p className="text-sm text-muted-foreground">Your order is on the way</p>
                    {order.tracking_number && (
                      <p className="text-sm font-mono mt-2 bg-secondary p-2 rounded">Tracking: {order.tracking_number}</p>
                    )}
                  </div>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep >= 4 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      ✓
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold">Delivered</h3>
                    <p className="text-sm text-muted-foreground">Package delivered successfully</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    {order.shipping_address?.firstName} {order.shipping_address?.lastName}
                  </p>
                  <p className="text-muted-foreground">{order.shipping_address?.address}</p>
                  <p className="text-muted-foreground">
                    {order.shipping_address?.city}, {getWilayaName(order.shipping_address?.wilaya)}
                  </p>
                  <p className="text-muted-foreground">{order.shipping_address?.postalCode}</p>
                </div>
              </div>

              <hr />

              {/* Contact Info */}
              <div>
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.shipping_address?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{order.shipping_address?.email}</span>
                  </div>
                </div>
              </div>

              <hr />

              {/* Order Total */}
              <div>
                <h3 className="font-semibold mb-4">Order Total</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  {order.shipping > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatPrice(order.shipping)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/account/orders">Back to Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </>
  )
}
