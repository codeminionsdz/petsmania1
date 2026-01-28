import { ProductCard } from "./product-card"
import type { Product } from "@/lib/types"

interface ProductGridProps {
  products: Product[]
  emptyMessage?: string
}

export function ProductGrid({ products, emptyMessage = "No products found." }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
