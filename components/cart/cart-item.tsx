"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import type { CartItem as CartItemType } from "@/lib/types"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()
  const { product, quantity } = item

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="shrink-0">
        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-secondary">
          <Image
            src={product.images[0] || "/placeholder.svg?height=80&width=80&query=health product"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${product.slug}`} className="font-medium hover:text-primary line-clamp-2">
          {product.name}
        </Link>
        <p className="text-sm text-muted-foreground mt-1">{product.brandName}</p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={() => updateQuantity(product.id, quantity - 1)}
          >
            <Minus className="h-3 w-3" />
            <span className="sr-only">Decrease quantity</span>
          </Button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-transparent"
            onClick={() => updateQuantity(product.id, quantity + 1)}
            disabled={quantity >= product.stock}
          >
            <Plus className="h-3 w-3" />
            <span className="sr-only">Increase quantity</span>
          </Button>
        </div>
      </div>

      {/* Price & Remove */}
      <div className="flex flex-col items-end justify-between">
        <span className="font-semibold">{formatPrice(product.price * quantity)}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => removeItem(product.id)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove item</span>
        </Button>
      </div>
    </div>
  )
}
