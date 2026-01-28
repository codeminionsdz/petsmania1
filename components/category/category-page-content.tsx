"use client"

import { useState } from "react"
import { ProductGrid } from "@/components/product/product-grid"
import { ProductFilters } from "@/components/filters/product-filters"
import { SortSelect } from "@/components/filters/sort-select"
import { PaginationControls } from "@/components/ui/pagination-controls"
import type { Category, Product, Brand, FilterOptions } from "@/lib/types"
import { getCategoryIcon } from "@/lib/category-icons"
import { getCategoryGradient } from "@/lib/category-colors"

interface CategoryPageContentProps {
  category: Category
  initialProducts: Product[]
  brands: Brand[]
  totalProducts: number
}

export function CategoryPageContent({ category, initialProducts, brands, totalProducts }: CategoryPageContentProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sortBy, setSortBy] = useState<FilterOptions["sortBy"]>("popular")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // In real app, this would trigger a new fetch
  const products = initialProducts
  
  const Icon = getCategoryIcon(category.slug)
  // Automatically generate gradient colors based on slug
  const gradient = getCategoryGradient(category.slug)

  return (
    <div>
      {/* Category Header with Gradient */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
            backgroundSize: '30px 30px'
          }} />
        </div>
        
        {/* Content */}
        <div className="relative px-6 py-12 md:px-12 md:py-16 flex items-center gap-6">
          <div className="p-4 md:p-5 rounded-full bg-white/20 backdrop-blur-sm">
            <Icon className="h-12 w-12 md:h-16 md:w-16 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">{category.name}</h1>
            <p className="text-white/90 max-w-2xl text-base md:text-lg drop-shadow-md">{category.description}</p>
            <p className="text-white/80 mt-2 text-sm md:text-base">{totalProducts} produits disponibles</p>
          </div>
        </div>
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <ProductFilters brands={brands} filters={filters} onFilterChange={setFilters} />

        {/* Products */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-muted-foreground">
              Showing {products.length} of {totalProducts} products
            </p>
            <div className="flex items-center gap-4">
              <SortSelect value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid products={products} emptyMessage="No products found in this category." />

          {/* Pagination */}
          {totalProducts > pageSize && (
            <div className="mt-8">
              <PaginationControls
                currentPage={currentPage}
                totalPages={Math.ceil(totalProducts / pageSize)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
