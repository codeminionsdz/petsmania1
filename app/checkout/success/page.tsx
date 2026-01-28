import Link from "next/link"
import { CheckCircle2, Package, Truck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; email?: string }>
}) {
  const { orderId, email } = await searchParams

  // Fetch order details from API
  let order = null
  if (orderId) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/account/orders?id=${orderId}`,
        {
          cache: "no-store",
        }
      )
      if (response.ok) {
        order = await response.json()
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your order. We've received your order and will begin processing it shortly.
        </p>

        {orderId && (
          <div className="bg-secondary rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">Order Number</p>
            <p className="text-lg font-mono font-bold">{orderId}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4 text-left">
            <Package className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-medium">Order Processing</h3>
            <p className="text-sm text-muted-foreground">
              Your order is being prepared and will be shipped within 24 hours.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-left">
            <Truck className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-medium">Delivery</h3>
            <p className="text-sm text-muted-foreground">
              You will receive a call from our delivery partner before delivery.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href={`/track-order?orderId=${orderId}`}>
              Track Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/categories">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
