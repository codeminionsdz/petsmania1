import { Suspense } from "react"
import { WilayasPageContent } from "@/components/admin/wilayas-page-content"
import { getSupabaseServerClient } from "@/lib/supabase/server"

async function getWilayas() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("wilayas")
    .select("*")
    .order("code")

  if (error) {
    console.error("Error fetching wilayas:", error)
    return []
  }

  return data || []
}

export default async function AdminWilayasPage() {
  const wilayas = await getWilayas()

  return <WilayasPageContent initialWilayas={wilayas} />
}
