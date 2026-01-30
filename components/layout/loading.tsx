import { Loader2 } from "lucide-react"
import { getLoadingSpinnerGradient } from "@/lib/animal-colors"
import type { AnimalType } from "@/lib/animal-colors"

interface LoadingSpinnerProps {
  className?: string
  animal?: AnimalType
}

export function LoadingSpinner({ className, animal }: LoadingSpinnerProps) {
  const spinnerColor = animal ? `text-${getLoadingSpinnerGradient(animal).split('-')[1]}-500` : "text-primary"
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`h-8 w-8 animate-spin ${spinnerColor}`} />
    </div>
  )
}

export function LoadingPage({ animal }: { animal?: AnimalType } = {}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner animal={animal} />
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 w-3 bg-muted rounded" />
          ))}
        </div>
        <div className="h-6 bg-muted rounded w-1/3" />
        <div className="h-10 bg-muted rounded" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
