import Image from "next/image"
import Link from "next/link"
import type { Brand } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BrandCardProps {
  brand: Brand
  className?: string
}

export function BrandCard({ brand, className }: BrandCardProps) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className={cn(
        "group flex flex-col items-center justify-center p-6 bg-card rounded-lg border border-border transition-all hover:shadow-lg hover:border-primary/30",
        className,
      )}
    >
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <Image
          src={brand.logo || "/placeholder.svg?height=128&width=128&query=brand logo"}
          alt={brand.name}
          fill
          className="object-contain grayscale group-hover:grayscale-0 transition-all"
          sizes="128px"
        />
      </div>
      <h3 className="mt-4 font-medium text-center group-hover:text-primary transition-colors">{brand.name}</h3>
      <p className="text-sm text-muted-foreground">{brand.productCount} products</p>
    </Link>
  )
}
