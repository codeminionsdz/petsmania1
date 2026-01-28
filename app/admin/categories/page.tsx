import { Suspense } from "react"
import { CategoriesPageContent } from "@/components/admin/categories-page-content"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminCategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      }
    >
      <CategoriesPageContent />
    </Suspense>
  )
}
