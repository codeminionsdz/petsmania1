"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronRight, Heart, ShoppingCart, Trash2, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/format"
import { createBrowserClient } from "@supabase/ssr"
import type { Product } from "@/lib/types"

export default function WishlistPage() {
  const router = useRouter()
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const { addItem, toggleCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Get current user
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          router.push("/login")
          return
        }

        // Get user's wishlist items with product details
        const { data: wishlistData, error: wishlistError } = await supabase
          .from("wishlist_items")
          .select(
            `
            id,
            product_id,
            products(
              *,
              product_images(*),
              categories(name),
              brands(name)
            )
          `
          )
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false })

        if (wishlistError) {
          console.error("Error loading wishlist:", wishlistError)
          setError("Failed to load wishlist")
          setIsLoading(false)
          return
        }

        if (wishlistData && wishlistData.length > 0) {
          // Map the wishlist items to products
          const products = wishlistData
            .map((item: any) => {
              if (!item.products) return null

              const product = item.products
              const images = product.product_images?.map((img: any) => img.url) || []

              return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                shortDescription: product.short_description,
                price: product.price,
                originalPrice: product.original_price,
                images: images,
                categoryId: product.category_id,
                categoryName: product.categories?.name || "",
                brandId: product.brand_id,
                brandName: product.brands?.name || "",
                stock: product.stock,
                sku: product.sku,
                featured: product.featured,
                tags: product.tags || [],
                createdAt: product.created_at,
                updatedAt: product.updated_at,
              } as Product
            })
            .filter((p) => p !== null)

          setWishlist(products)
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error loading wishlist:", err)
        setError("Failed to load wishlist")
        setIsLoading(false)
      }
    }

    loadWishlist()
  }, [router])

  const handleRemove = async (productId: string) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) return

      // Remove from database
      await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", authUser.id)
        .eq("product_id", productId)

      // Update local state
      setWishlist(wishlist.filter((p) => p.id !== productId))
      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist.",
      })
    } catch (err) {
      console.error("Error removing from wishlist:", err)
      toast({
        title: "Error",
        description: "Failed to remove product from wishlist",
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
    toggleCart()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="bg-secondary py-3">
        <div className="container mx-auto px-4">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li>
              <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors">
                Account
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li className="text-foreground font-medium">Wishlist</li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">
          My Wishlist <span className="text-muted-foreground font-normal">({wishlist.length} items)</span>
        </h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save your favorite products for later.</p>
            <Button asChild>
              <Link href="/categories">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product.id} className="bg-card border border-border rounded-lg overflow-hidden group">
                <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-white">
                  <Image
                    src={product.images[0] || "/placeholder.svg?height=300&width=300&query=product"}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleRemove(product.id)
                    }}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-destructive hover:text-white transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </Link>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">{product.brandName}</p>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-medium mt-1 line-clamp-2 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-semibold text-primary">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <Button
                    className="w-full mt-4"
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
