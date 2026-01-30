import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Category, AnimalType } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getCategoryIcon } from "@/lib/category-icons"
import { getCategoryGradient } from "@/lib/category-colors"

interface SubcategoryCardProps {
  subcategory: Category
  animalType: AnimalType
  className?: string
}

export function SubcategoryCard({ subcategory, animalType, className }: SubcategoryCardProps) {
  const Icon = getCategoryIcon(subcategory.slug)
  // Automatically generate gradient colors based on slug
  const gradient = getCategoryGradient(subcategory.slug)
  
  // Generate animal-scoped href
  const href = `/${animalType}/${subcategory.slug}`

  return (
    <Link
      href={href}
      className={cn(
        "group relative aspect-[4/3] overflow-hidden rounded-xl border border-border transition-all duration-300",
        "hover:shadow-xl hover:border-primary/40 hover:-translate-y-1.5",
        className,
      )}
    >
      {/* Gradient Background */}
      <div className={cn("absolute inset-0", gradient, "opacity-90 group-hover:opacity-100 transition-opacity")} />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Icon */}
      <div className="absolute top-4 right-4 p-3 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
        <Icon className="h-6 w-6 text-white drop-shadow-lg" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/50 to-transparent">
        <h3 className="text-sm md:text-base font-bold text-white line-clamp-2 drop-shadow-lg mb-2">
          {subcategory.name}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-xs text-white/90 font-medium group-hover:text-white group-hover:gap-2 transition-all">
          Voir les produits
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>

      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </Link>
  )
}
