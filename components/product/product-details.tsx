"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingCart, Heart, Truck, ShieldCheck, RotateCcw, Check, Minus, Plus, Share2, Copy, Facebook, MessageCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { useToast } from "@/hooks/use-toast"
import { formatPrice, calculateDiscount } from "@/lib/format"
import type { Product } from "@/lib/types"

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const { addItem, toggleCart } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()

  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = hasDiscount ? calculateDiscount(product.originalPrice!, product.price) : 0
  const isInStock = product.stock > 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  // Get product URL
  const productUrl = typeof window !== "undefined" ? `${window.location.origin}/products/${product.slug}` : ""

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast({
      title: "Added to cart",
      description: `${product.name} x${quantity} has been added to your cart.`,
    })
    toggleCart()
  }

  const handleWishlist = async () => {
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id)
        toast({
          title: "Removed from Wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        })
      } else {
        await addToWishlist(product)
        toast({
          title: "Added to Wishlist",
          description: `${product.name} has been added to your wishlist.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Please log in to save to wishlist.",
        variant: "destructive",
      })
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl)
    toast({
      title: "Link copied",
      description: "Product link has been copied to clipboard.",
    })
    setShowShareMenu(false)
  }

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`
    window.open(url, "_blank", "width=600,height=400")
    setShowShareMenu(false)
  }

  const handleShareWhatsApp = () => {
    const text = `Check out this product: ${product.name} - ${formatPrice(product.price)}\n${productUrl}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
    setShowShareMenu(false)
  }

  const handleShareEmail = () => {
    const subject = `Check out: ${product.name}`
    const body = `I found this product that I thought you might like:\n\n${product.name}\nPrice: ${formatPrice(product.price)}\n\n${productUrl}`
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = url
    setShowShareMenu(false)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Share Menu Backdrop */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowShareMenu(false)}
        />
      )}
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-white border border-border">
          <Image
            src={product.images[selectedImage] || "/placeholder.svg?height=600&width=600&query=product image"}
            alt={product.name}
            fill
            className="object-contain p-4"
            priority
          />
          {hasDiscount && (
            <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${
                  selectedImage === index ? "border-primary" : "border-border hover:border-muted-foreground"
                }`}
              >
                <Image
                  src={image || "/placeholder.svg?height=80&width=80&query=product thumbnail"}
                  alt={`${product.name} view ${index + 1}`}
                  fill
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Brand */}
        <div className="text-sm text-muted-foreground">{product.brandName}</div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

        {/* SKU */}
        <div className="text-sm text-muted-foreground">SKU: {product.sku}</div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-xl text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          {isInStock ? (
            <>
              <Check className="h-5 w-5 text-green-600" />
              <span className={`font-medium ${isLowStock ? "text-orange-600" : "text-green-600"}`}>
                {isLowStock ? `Only ${product.stock} left in stock` : "In Stock"}
              </span>
            </>
          ) : (
            <span className="text-destructive font-medium">Out of Stock</span>
          )}
        </div>

        {/* Short Description */}
        <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>

        {/* Quantity & Add to Cart */}
        <div className="flex flex-col gap-4">
          {/* Quantity Selector & Add to Cart - on one row on desktop, stacked on mobile */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-muted transition-colors"
                disabled={!isInStock}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-3 hover:bg-muted transition-colors"
                disabled={!isInStock || quantity >= product.stock}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button size="lg" className="sm:flex-1" onClick={handleAddToCart} disabled={!isInStock}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>

          {/* Wishlist & Share Buttons - on one row */}
          <div className="flex gap-3">
            <Button 
              size="lg" 
              variant="outline" 
              className={`flex-1 sm:flex-none sm:px-4 bg-transparent transition-colors ${isInWishlist(product.id) ? "bg-red-50 border-red-300" : ""}`}
              onClick={handleWishlist}
              title="Add to Wishlist"
            >
              <Heart className={`h-6 w-6 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`} />
              <span className="sm:hidden ml-2">Wishlist</span>
            </Button>

            {/* Share Button with Menu */}
            <div className="flex-1 sm:flex-none relative">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto sm:px-4 bg-transparent flex justify-center sm:justify-center"
                onClick={() => setShowShareMenu(!showShareMenu)}
                title="Share Product"
              >
                <Share2 className="h-6 w-6" />
                <span className="sm:hidden ml-2">Share</span>
              </Button>

              {/* Share Menu */}
              {showShareMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-10">
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-secondary transition-colors border-b border-border"
                  >
                    <Copy className="h-5 w-5" />
                    <span className="text-sm font-medium">Copy Link</span>
                  </button>

                  <button
                    onClick={handleShareFacebook}
                    className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-secondary transition-colors border-b border-border"
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Share on Facebook</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-secondary transition-colors border-b border-border"
                  >
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Share on WhatsApp</span>
                  </button>

                  <button
                    onClick={handleShareEmail}
                    className="w-full px-4 py-4 text-left flex items-center gap-3 hover:bg-secondary transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    <span className="text-sm font-medium">Share via Email</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
          <div className="flex flex-col items-center text-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground">Fast Delivery</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground">100% Authentic</span>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <RotateCcw className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground">Easy Returns</span>
          </div>
        </div>

        {/* Full Description */}
        <div className="pt-6 border-t border-border">
          <h3 className="font-semibold mb-3">Description</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="pt-6 border-t border-border">
            <h3 className="font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
