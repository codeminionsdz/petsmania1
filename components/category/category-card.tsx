import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Category } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
  category: Category
  className?: string
  variant?: "default" | "large"
}

export function CategoryCard({ category, className, variant = "default" }: CategoryCardProps) {
  // If category has subcategories, link to the first one; otherwise link to the category itself
  const href =
    category.children && category.children.length > 0
      ? `/categories/${category.children[0].slug}`
      : `/categories/${category.slug}`

  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]",
        variant === "large" ? "aspect-[4/3]" : "aspect-square",
        className,
      )}
    >
      <Image
        src={category.image || "/pet-category.jpg"}
        alt={category.name}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold text-background">{category.name}</h3>
        <p className="text-sm text-background/80 mt-1">
          {category.children && category.children.length > 0
            ? `${category.children.length} sous-catégories`
            : `${category.productCount} produits`}
        </p>
        <span className="inline-flex items-center gap-1 text-sm text-background font-medium mt-2 group-hover:underline">
          Découvrir
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}
