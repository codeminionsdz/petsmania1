"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { Product } from "./types"

interface WishlistContextType {
  items: Product[]
  addItem: (product: Product) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  isLoading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Load wishlist from database on mount
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsLoading(false)
          return
        }

        const { data: wishlistData, error } = await supabase
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
          .eq("user_id", user.id)

        if (error) {
          console.error("Error loading wishlist:", error)
          setIsLoading(false)
          return
        }

        if (wishlistData && wishlistData.length > 0) {
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

          setItems(products)
        }
      } catch (err) {
        console.error("Failed to load wishlist:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadWishlist()
  }, [])

  const addItem = async (product: Product) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User must be logged in")
      }

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single()

      if (existing) {
        return
      }

      // Add to database
      const { error } = await supabase.from("wishlist_items").insert({
        user_id: user.id,
        product_id: product.id,
      })

      if (error) {
        throw error
      }

      // Update local state
      if (!items.find((item) => item.id === product.id)) {
        setItems([...items, product])
      }
    } catch (err) {
      console.error("Error adding to wishlist:", err)
      throw err
    }
  }

  const removeItem = async (productId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User must be logged in")
      }

      // Remove from database
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId)

      if (error) {
        throw error
      }

      // Update local state
      setItems(items.filter((item) => item.id !== productId))
    } catch (err) {
      console.error("Error removing from wishlist:", err)
      throw err
    }
  }

  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => item.id === productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
