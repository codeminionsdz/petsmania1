import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Category } from "@/lib/types"
import { getCategoryIcon } from "@/lib/category-icons"
import { cn } from "@/lib/utils"

interface MainCategoryCardProps {
  category: Category
  className?: string
}

export function MainCategoryCard({ category, className }: MainCategoryCardProps) {
  const Icon = getCategoryIcon(category.slug)

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        "group relative flex flex-col items-center justify-center p-6 overflow-hidden rounded-2xl bg-white border border-border transition-all duration-300",
        "hover:shadow-lg hover:border-primary/30 hover:-translate-y-1",
        "aspect-square",
        className,
      )}
    >
      {/* Icon container */}
      <div className="relative mb-4 p-4 rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
        <Icon className="h-8 w-8 md:h-10 md:w-10" strokeWidth={1.5} />
      </div>

      {/* Category info */}
      <div className="relative text-center z-10">
        <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
          {category.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {category.children && category.children.length > 0
            ? `${category.children.length} sous-catégories`
            : `${category.productCount || 0} produits`}
        </p>
        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          Découvrir
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}
