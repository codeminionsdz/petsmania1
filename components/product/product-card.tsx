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
        "group relative bg-card rounded-pet-lg border border-border overflow-hidden transition-all duration-300 ease-out hover:shadow-pet-lg hover:-translate-y-2 hover:scale-[1.02]",
        className,
      )}
    >
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-secondary">
        <Image
          src={product.images[0] || "/placeholder.svg?height=300&width=300&query=pet product"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {hasDiscount && (
            <Badge className="bg-destructive text-destructive-foreground font-bold text-sm px-3 py-1 rounded-full shadow-md">
              -{discountPercentage}%
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="bg-red-100 text-red-700 font-semibold">
              Out of Stock
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-accent text-accent-foreground font-semibold rounded-full">
              🌟 Featured
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white shadow-md hover:bg-primary hover:text-white rounded-full hover:scale-110"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            // TODO: Add wishlist functionality
          }}
        >
          <Heart className="h-5 w-5 transition-transform duration-200" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </Link>

      {/* Content */}
      <div className="p-6 space-y-3">
        {/* Brand */}
        <Link
          href={`/brands/${product.brandId}`}
          className="text-xs font-semibold text-primary hover:text-orange-600 transition-colors uppercase tracking-wide"
          onClick={(e) => e.stopPropagation()}
        >
          {product.brandName}
        </Link>

        {/* Name */}
        <h3 className="font-semibold line-clamp-2 min-h-[2.5rem] text-foreground leading-tight">
          <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("h-4 w-4", i < 4 ? "fill-accent text-accent" : "fill-muted text-muted")} />
          ))}
          <span className="text-xs text-muted-foreground ml-1 font-medium">(24)</span>
        </div>

        {/* Price Section - Highlighted */}
        <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-semibold mb-1">PRICE</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</span>
                )}
              </div>
            </div>
            {hasDiscount && (
              <div className="text-center">
                <span className="text-xl font-bold text-destructive">Save</span>
                <p className="text-xs text-destructive">{formatPrice(product.originalPrice! - product.price)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Add to cart - Prominent */}
        <Button 
          className="w-full mt-4 btn-pet bg-primary hover:bg-orange-600 text-white font-bold text-base h-12 rounded-lg shadow-pet-md hover:shadow-pet-lg transition-all duration-300 hover:-translate-y-1 group/btn"
          onClick={handleAddToCart} 
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-5 w-5 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </article>
  )
}
