"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

export default function OrdersDebugPage() {
  const router = useRouter()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const debug = async () => {
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

        if (!authUser) {
          setDebugInfo({ error: "No authenticated user" })
          setLoading(false)
          return
        }

        const info: any = {
          user_id: authUser.id,
          user_email: authUser.email,
        }

        // Check all orders in the database
        const { data: allOrders, error: allOrdersError } = await supabase
          .from("orders")
          .select("id, user_id, guest_email, created_at")

        info.all_orders_count = allOrders?.length || 0
        info.all_orders = allOrders
        info.all_orders_error = allOrdersError

        // Check orders for current user
        const { data: userOrders, error: userOrdersError } = await supabase
          .from("orders")
          .select("id, user_id, guest_email, created_at")
          .eq("user_id", authUser.id)

        info.user_orders_count = userOrders?.length || 0
        info.user_orders = userOrders
        info.user_orders_error = userOrdersError

        setDebugInfo(info)
        setLoading(false)
      } catch (err) {
        setDebugInfo({ error: String(err) })
        setLoading(false)
      }
    }

    debug()
  }, [])

  if (loading) return <div className="p-4">جاري التحميل...</div>

  return (
    <div className="p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">تشخيص الطلبيات</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <button
        onClick={() => router.back()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        العودة
      </button>
    </div>
  )
}
