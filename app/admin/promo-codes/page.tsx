import { PromoCodesPageContent } from "@/components/admin/promo-codes-page-content"
import { getSupabaseServerClient } from "@/lib/supabase/server"

async function getPromoCodes() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching promo codes:", error)
    return []
  }

  return data || []
}

export default async function AdminPromoCodesPage() {
  const promoCodes = await getPromoCodes()

  return <PromoCodesPageContent initialPromoCodes={promoCodes} />
}
