"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Package, MapPin, Heart, Settings, LogOut, ChevronRight, ShoppingBag, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice, formatDate } from "@/lib/format"
import { createBrowserClient } from "@supabase/ssr"
import type { Order } from "@/lib/types"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  avatar_url: string | null
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const accountLinks = [
  { href: "/account/orders", label: "My Orders", icon: Package, description: "View order history and track shipments" },
  { href: "/account/addresses", label: "Addresses", icon: MapPin, description: "Manage your shipping addresses" },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart, description: "Products you've saved for later" },
  { href: "/account/settings", label: "Settings", icon: Settings, description: "Account preferences and security" },
]

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const loadUserData = async () => {
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
          router.push("/login")
          return
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()

        if (profileError || !profile) {
          setError("Failed to load profile")
          setIsLoading(false)
          return
        }

        setUser({
          id: profile.id,
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || authUser.email || "",
          phone: profile.phone || null,
          avatar_url: profile.avatar_url || null,
        })

        // Get recent orders from API (handles both authenticated and guest orders)
        console.log("Fetching recent orders from API...")
        const response = await fetch("/api/account/orders", {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const result = await response.json()
          const allOrders = result.data || []
          // Get only the first 5 for the dashboard
          setRecentOrders(allOrders.slice(0, 5) as Order[])
          console.log("Recent orders loaded:", allOrders.length, "total orders")
        } else {
          console.error("Failed to fetch orders from API:", response.status)
          setError("Failed to load orders")
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error loading account data:", err)
        setError("Failed to load account data")
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router])
  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 flex items-center justify-center min-h-[70vh]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">{error || "Failed to load account"}</p>
          <Button className="mt-4" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user.firstName}!</h1>
        <p className="text-muted-foreground mt-1">{user.email}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Links */}
          <div className="grid sm:grid-cols-2 gap-4">
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary transition-colors group"
              >
                <div className="p-2 rounded-lg bg-secondary">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium group-hover:text-primary transition-colors">{link.label}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Link href="/account/orders" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
                <Button asChild className="mt-4">
                  <Link href="/categories">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.total)}</p>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{user.phone || "No phone"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                <Link href="/account/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
