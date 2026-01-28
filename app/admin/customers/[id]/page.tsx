import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice, formatDate } from "@/lib/format"

interface CustomerProfilePageProps {
  params: {
    id: string
  }
}

async function getCustomerDetails(customerId: string) {
  const supabase = await getSupabaseAdminClient()

  console.log("🔍 Fetching details for customer:", customerId)
  console.log("ℹ️ Using admin client to bypass RLS")
  console.log("📝 If you see errors below: Apply script 026-ultimate-admin-rls-fix.sql")
  console.log("---")

  try {
    // Get customer profile
    const { data: customer, error: customerError } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name, phone, created_at")
      .eq("id", customerId)
      .single()

    if (customerError || !customer) {
      console.error("❌ Error fetching customer:", customerError)
      return null
    }

    console.log("✅ Customer found:", customer.email)

    // Get customer orders - use admin client which should bypass RLS
    let orders: any[] = []
    try {
      console.log("📦 Step 1: Fetching orders...")
      
      // Try method 1: Direct query with nested select
      let { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          `
        id,
        total,
        status,
        created_at,
        order_items (
          id,
          quantity,
          price,
          product_id
        )
      `
        )
        .eq("user_id", customerId)
        .order("created_at", { ascending: false })
      
      console.log("  Try 1 - Nested query:", ordersError ? "❌ Failed" : "✅ Success")
      
      // If that fails due to RLS, try without nested select
      if (ordersError) {
        console.log("  Try 2 - Fallback query without nested...")
        const { data: ordersData2, error: ordersError2 } = await supabase
          .from("orders")
          .select("id, total, status, created_at, user_id")
          .eq("user_id", customerId)
          .order("created_at", { ascending: false })
        
        console.log("  Try 2 Result:", ordersError2 ? "❌ Failed" : "✅ Success")
        ordersData = (ordersData2 as any) || null
        ordersError = ordersError2
      }

      if (ordersError) {
        console.error("❌ Orders failed after all attempts:", ordersError)
        console.log("💡 NEXT STEP: Apply script scripts/026-ultimate-admin-rls-fix.sql")
      } else {
        orders = ordersData || []
        console.log("✅ Orders loaded:", orders.length, "order(s)")
      }
    } catch (e) {
      console.error("❌ Exception in orders fetch:", e)
    }

    // Get customer addresses
    let addresses: any[] = []
    try {
      console.log("📍 Step 2: Fetching addresses...")
      
      // Try method 1: Full query with all fields
      let { data: addressesData, error: addressesError } = await supabase
        .from("addresses")
        .select("id, full_name, phone, address, city, wilaya_id, postal_code, is_default, wilayas(id, name)")
        .eq("user_id", customerId)
      
      console.log("  Try 1 - Full fields:", addressesError ? "❌ Failed" : "✅ Success")
      
      // If that fails, try without is_default field
      if (addressesError) {
        console.log("  Try 2 - Without is_default field...")
        const { data: addressesData2, error: addressesError2 } = await supabase
          .from("addresses")
          .select("id, full_name, phone, address, city, wilaya_id, postal_code, wilayas(id, name)")
          .eq("user_id", customerId)
        
        console.log("  Try 2 Result:", addressesError2 ? "❌ Failed" : "✅ Success")
        
        if (!addressesError2) {
          addressesData = (addressesData2 as any) || null
          addressesError = null
        } else {
          // Try method 3: Select all (last resort)
          console.log("  Try 3 - Select all (last resort)...")
          const { data: addressesData3, error: addressesError3 } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", customerId)
          
          console.log("  Try 3 Result:", addressesError3 ? "❌ Failed" : "✅ Success")
          addressesData = (addressesData3 as any) || null
          addressesError = addressesError3
        }
      }

      if (addressesError) {
        console.error("❌ Addresses failed after all attempts:", addressesError)
        console.log("💡 NEXT STEP: Apply script scripts/026-ultimate-admin-rls-fix.sql")
        console.log("📖 Instructions: See APPLY_FIX_026.md file")
        
        // Last resort: try to get any data at all
        console.log("🔄 Attempting absolute final fallback (unfiltered query)...")
        const { data: allAddresses } = await supabase
          .from("addresses")
          .select("*")
        
        if (allAddresses && allAddresses.length > 0) {
          addresses = allAddresses.filter((a: any) => a.user_id === customerId)
          console.log("🎯 Final fallback successful:", addresses.length, "address(es)")
        }
      } else {
        addresses = addressesData || []
        console.log("✅ Addresses loaded:", addresses.length, "address(es)")
      }
    } catch (e) {
      console.error("❌ Exception in addresses fetch:", e)
    }

    console.log("---")
    console.log("📊 Final Summary:")
    console.log("  Orders:", orders.length)
    console.log("  Addresses:", addresses.length)
    console.log("✅ Customer data fetch complete\n")

    return {
      customer,
      orders,
      addresses,
    }
  } catch (error) {
    console.error("Critical error in getCustomerDetails:", error)
    return null
  }
}

export default async function CustomerProfilePage({ params }: CustomerProfilePageProps) {
  // Await params in Server Component
  const { id } = await params
  const data = await getCustomerDetails(id)

  if (!data) {
    notFound()
  }

  const { customer, orders, addresses } = data
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {customer.first_name} {customer.last_name}
            </h1>
            <p className="text-muted-foreground">{customer.email}</p>
          </div>
        </div>
      </div>

      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="text-lg font-semibold">{customer.email}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Phone</p>
          <p className="text-lg font-semibold">{customer.phone || "Not provided"}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-lg font-semibold">{orders.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <p className="text-lg font-semibold">{formatPrice(totalSpent)}</p>
        </div>
      </div>

      {/* Joined Date */}
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Joined</p>
        <p className="text-lg font-semibold">{formatDate(customer.created_at)}</p>
      </div>

      {/* Send Email Button */}
      <div className="flex gap-2">
        <Link href={`/admin/customers/${customer.id}/send-email`}>
          <Button className="gap-2">
            <Mail className="h-4 w-4" />
            Send Email
          </Button>
        </Link>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Orders ({orders.length})</h2>
        {orders.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-semibold">Order ID</th>
                    <th className="text-left p-4 font-semibold">Date</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Items</th>
                    <th className="text-right p-4 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50">
                      <td className="p-4 font-mono text-sm">{order.id.slice(0, 8)}...</td>
                      <td className="p-4">{formatDate(order.created_at)}</td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">{order.order_items?.length || 0} items</td>
                      <td className="p-4 text-right font-semibold">{formatPrice(order.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Addresses Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Addresses ({addresses.length})</h2>
        {addresses.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No addresses saved</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div key={address.id} className="bg-card border border-border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <p className="font-semibold">{address.full_name}</p>
                  {address.is_default && (
                    <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{address.address}</p>
                <p className="text-sm text-muted-foreground">
                  {address.city}, {address.wilayas?.name || address.wilaya_id} {address.postal_code}
                </p>
                <p className="text-sm text-muted-foreground">{address.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
