import { Suspense } from "react"
import { ProductsPageContent } from "@/components/admin/products-page-content"

export default function AdminProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  )
}
