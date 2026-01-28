import { Suspense } from "react"
import { BrandsPageContent } from "@/components/admin/brands-page-content"

export default function AdminBrandsPage() {
  return (
    <Suspense fallback={null}>
      <BrandsPageContent />
    </Suspense>
  )
}
