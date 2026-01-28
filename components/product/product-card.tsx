"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart()
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
  }

  return (
    <article
      className={cn(
        "group relative bg-card rounded-lg border border-border overflow-hidden transition-shadow hover:shadow-lg",
        className,
      )}
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden">
        <Image
          src={product.images[0] || "/placeholder.svg?height=300&width=300&query=health product"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && <Badge className="bg-destructive text-destructive-foreground">-{discountPercentage}%</Badge>}
          {product.stock === 0 && <Badge variant="secondary">Out of Stock</Badge>}
          {product.featured && <Badge className="bg-accent text-accent-foreground">Featured</Badge>}
        </div>

        {/* Wishlist button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            // TODO: Add wishlist functionality
          }}
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        <Link
          href={`/brands/${product.brandId}`}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {product.brandName}
        </Link>

        {/* Name */}
        <h3 className="mt-1 font-medium line-clamp-2 min-h-[2.5rem]">
          <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Rating placeholder */}
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("h-3 w-3", i < 4 ? "fill-accent text-accent" : "fill-muted text-muted")} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">(24)</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</span>
          )}
        </div>

        {/* Add to cart */}
        <Button className="w-full mt-4" onClick={handleAddToCart} disabled={product.stock === 0}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </article>
  )
}
