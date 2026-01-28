import { CustomersPageContent } from "@/components/admin/customers-page-content"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

async function getCustomers() {
  const supabase = await getSupabaseAdminClient()

  try {
    // أولاً، تحقق من جميع المستخدمين بدون فلتر
    const { data: allProfiles, error: allError } = await supabase
      .from("profiles")
      .select("id, email, role, first_name, last_name, phone, created_at")

    console.log("✅ All profiles count:", allProfiles?.length)
    console.log("✅ All profiles sample:", allProfiles?.slice(0, 3))
    if (allError) console.error("❌ All profiles error:", allError)

    // إذا لم نجد أي مستخدمين، أرجع مصفوفة فارغة
    if (!allProfiles || allProfiles.length === 0) {
      console.log("⚠️ No profiles found at all")
      return []
    }

    // استخدم جميع المستخدمين كمستخدمين (بدل التصفية بـ role)
    const customers = allProfiles

    // Get order stats for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer: any) => {
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("total, created_at")
          .eq("user_id", customer.id)

        if (ordersError) {
          console.error(`Error fetching orders for ${customer.id}:`, ordersError)
        }

        const totalSpent = orders?.reduce((sum: number, order: any) => sum + order.total, 0) || 0
        const lastOrder = orders?.[0]?.created_at || null

        return {
          id: customer.id,
          name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.email || "Customer",
          email: customer.email,
          phone: customer.phone || "",
          orders: orders?.length || 0,
          totalSpent,
          lastOrder,
          createdAt: customer.created_at,
        }
      })
    )

    console.log("✅ Final customers with stats:", customersWithStats)
    return customersWithStats
  } catch (err) {
    console.error("❌ Error in getCustomers:", err)
    return []
  }
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers()

  return <CustomersPageContent initialCustomers={customers} />
}
