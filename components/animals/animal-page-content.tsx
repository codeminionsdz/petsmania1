'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/product/product-card'
import { ProductFilters } from '@/components/filters/product-filters'
import { LoadingSpinner } from '@/components/layout/loading'
import { getAnimalColors } from '@/lib/animal-colors'
import type { Product, Category, Brand, AnimalType, PaginatedResponse, Subcategory } from '@/lib/types'

interface AnimalPageContentProps {
  animalType: AnimalType
  animalDisplayName: string
  emoji: string
  categories: Category[]
  subcategories: Subcategory[]
  brands: Brand[]
  initialProducts: PaginatedResponse<Product>
}

export function AnimalPageContent({
  animalType,
  animalDisplayName,
  emoji,
  categories,
  subcategories,
  brands,
  initialProducts,
}: AnimalPageContentProps) {
  const [products, setProducts] = useState(initialProducts)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const currentFiltersRef = useRef<any>({})
  const isFetchingRef = useRef(false) // Track fetching state synchronously
  const lastFetchTimeRef = useRef(0) // Debounce rapid calls

  const handleFilterChange = useCallback(async (filters: any) => {
    // Save the current filters to ref (not state to avoid infinite loops)
    currentFiltersRef.current = filters
    
    // Prevent duplicate calls within 500ms (debounce)
    const now = Date.now()
    if (now - lastFetchTimeRef.current < 500) {
      console.debug('[AnimalPageContent] Too soon, debouncing this call')
      return
    }
    lastFetchTimeRef.current = now

    // Prevent concurrent requests using synchronous ref check
    if (isFetchingRef.current) {
      console.debug('[AnimalPageContent] Request already in flight, ignoring duplicate call')
      return
    }

    console.debug("[AnimalPageContent] handleFilterChange start", { filters })
    isFetchingRef.current = true
    setLoading(true)

    const controller = new AbortController()
    // Prevent a hanging fetch from keeping the spinner alive
    const FETCH_TIMEOUT_MS = 15000
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      // Build query parameters
      const params = new URLSearchParams()
      if (filters.categories?.length) params.append('categories', filters.categories.join(','))
      if (filters.subcategories?.length) params.append('subcategories', filters.subcategories.join(','))
      if (filters.brands?.length) params.append('brands', filters.brands.join(','))
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
      if (filters.inStock) params.append('inStock', 'true')
      if (filters.sortBy) params.append('sortBy', filters.sortBy)

      const url = `/api/animals/${animalType}/products?${params.toString()}`
      console.debug("[AnimalPageContent] fetching url", url)

      const response = await fetch(url, { signal: controller.signal })
      console.debug("[AnimalPageContent] fetch response", { status: response.status })

      // If response is not ok, treat as empty results but still clear loading
      if (!response.ok) {
        console.warn('[AnimalPageContent] fetch returned non-OK status', response.status)
        setProducts({ data: [], total: 0, page: 1, totalPages: 1, pageSize: 12 })
        return
      }

      const data = await response.json()
      console.debug("[AnimalPageContent] fetch data", data)
      setProducts(data)
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error('[AnimalPageContent] fetch aborted due to timeout')
      } else {
        console.error('Failed to filter products:', error)
      }
      // On error, ensure UI shows empty results instead of spinning forever
      setProducts((prev) => prev || { data: [], total: 0, page: 1, totalPages: 1, pageSize: 12 })
    } finally {
      clearTimeout(timeout)
      isFetchingRef.current = false
      setLoading(false)
      console.debug("[AnimalPageContent] handleFilterChange end, loading=false")
    }
  }, [animalType])

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // Clear subcategory selection when changing category
    setSelectedSubcategory(null)
    handleFilterChange({ categories: [categoryId] })
  }

  const handleSubcategorySelect = (subcategoryId: string, parentCategoryId: string) => {
    // If toggling the same subcategory, clear it
    const next = selectedSubcategory === subcategoryId ? null : subcategoryId
    setSelectedSubcategory(next)
    // Ensure parent category is selected as well
    setSelectedCategory(parentCategoryId)
    if (next) {
      handleFilterChange({ categories: [parentCategoryId], subcategories: [next] })
    } else {
      // clearing subcategory means filter only by parent category
      handleFilterChange({ categories: [parentCategoryId] })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Loading Overlay - ONLY shown when loading is true */}
      {loading === true ? (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: getAnimalColors(animalType as AnimalType).transitionOverlay }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-lg p-8 shadow-xl">
            <LoadingSpinner animal={animalType as AnimalType} />
            <p className="text-center mt-4 text-muted-foreground">Loading products...</p>
          </div>
        </div>
      ) : null}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{emoji}</span>
            <h1 className="text-4xl font-bold title-settle">{animalDisplayName}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Discover our complete collection of premium products for your {animalType.toLowerCase()}s.
            From food and toys to health supplements and accessories.
          </p>
        </div>
      </div>

      {/* Main Content - Categories and Products */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Categories and Filters */}
            <aside className="lg:col-span-1 space-y-8">
              {/* Categories */}
              {categories.length > 0 && (
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="font-semibold text-lg mb-4">Browse by Category</h3>
                  <nav className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(null)
                        handleFilterChange({})
                      }}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${
                        selectedCategory === null
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      All Products
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`w-full text-left px-3 py-2 rounded transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-secondary'
                        }`}
                      >
                        <span className="font-medium">{category.name}</span>
                        {category.productCount > 0 && (
                          <span className="text-xs ml-2 opacity-75">({category.productCount})</span>
                        )}
                      </button>
                    ))}
                    {/* Subcategories list for currently selected category */}
                    {selectedCategory && (
                      <div className="mt-3 pl-4">
                        {subcategories
                          .filter((s) => s.category_id === selectedCategory)
                          .map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleSubcategorySelect(sub.id, selectedCategory)}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                selectedSubcategory === sub.id ? 'bg-secondary/60' : 'hover:bg-secondary'
                              }`}
                            >
                              {sub.name}
                              {sub.productCount ? (
                                <span className="text-xs ml-2 opacity-75">({sub.productCount})</span>
                              ) : null}
                            </button>
                          ))}
                      </div>
                    )}
                  </nav>
                </div>
              )}

              {/* Brands */}
              {brands.length > 0 && (
                <div className="bg-card rounded-lg border p-6">
                  <h3 className="font-semibold text-lg mb-4">Brands</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {brands.map((brand) => (
                      <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          onChange={(e) => {
                            // Handle brand filter change
                            const currentFilters = {
                              categories: selectedCategory ? [selectedCategory] : [],
                            }
                            // Add/remove brand from filters
                            handleFilterChange(currentFilters)
                          }}
                          className="rounded"
                        />
                        <span className="text-sm hover:text-primary">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Main Content - Products */}
            <div className="lg:col-span-3">
              {/* Product Filters */}
              <div className="mb-6">
                <ProductFilters 
                  categories={categories}
                  subcategories={subcategories}
                  brands={brands}
                  filters={currentFiltersRef.current} 
                  onFilterChange={handleFilterChange}
                />
              </div>

              {/* Products Grid */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {selectedCategory ? 'Filtered Results' : 'All Products'}
                  </h2>
                  <span className="text-muted-foreground">{products.total} products</span>
                </div>

                {products.data.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.data.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {products.totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: products.totalPages }).map((_, i) => (
                          <button
                            key={i}
                            className={`px-4 py-2 rounded border transition-colors ${
                              products.page === i + 1
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:border-primary'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No products found</p>
                    <button
                      onClick={() => {
                        setSelectedCategory(null)
                        handleFilterChange({})
                      }}
                      className="text-primary hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
