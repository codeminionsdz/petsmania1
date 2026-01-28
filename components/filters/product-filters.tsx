"use client"

import { useState } from "react"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { formatPrice } from "@/lib/format"
import type { Brand, Category, FilterOptions } from "@/lib/types"

interface ProductFiltersProps {
  categories?: Category[]
  brands?: Brand[]
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  maxPrice?: number
}

export function ProductFilters({
  categories = [],
  brands = [],
  filters,
  onFilterChange,
  maxPrice = 50000,
}: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([filters.minPrice || 0, filters.maxPrice || maxPrice])

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const current = filters.categories || []
    const updated = checked ? [...current, categoryId] : current.filter((id) => id !== categoryId)
    onFilterChange({ ...filters, categories: updated })
  }

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const current = filters.brands || []
    const updated = checked ? [...current, brandId] : current.filter((id) => id !== brandId)
    onFilterChange({ ...filters, brands: updated })
  }

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]])
  }

  const handlePriceCommit = () => {
    onFilterChange({ ...filters, minPrice: priceRange[0], maxPrice: priceRange[1] })
  }

  const handleInStockChange = (checked: boolean) => {
    onFilterChange({ ...filters, inStock: checked || undefined })
  }

  const clearFilters = () => {
    setPriceRange([0, maxPrice])
    onFilterChange({})
  }

  const hasActiveFilters =
    (filters.categories && filters.categories.length > 0) ||
    (filters.brands && filters.brands.length > 0) ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock

  const FiltersContent = () => (
    <div className="space-y-6">
      {hasActiveFilters && (
        <Button variant="ghost" className="w-full justify-start" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear all filters
        </Button>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
            Categories
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={filters.categories?.includes(category.id) || false}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                />
                <Label htmlFor={`cat-${category.id}`} className="text-sm font-normal cursor-pointer flex-1">
                  {category.name}
                  <span className="text-muted-foreground ml-1">({category.productCount})</span>
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
            Brands
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={filters.brands?.includes(brand.id) || false}
                  onCheckedChange={(checked) => handleBrandChange(brand.id, checked as boolean)}
                />
                <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal cursor-pointer flex-1">
                  {brand.name}
                  <span className="text-muted-foreground ml-1">({brand.productCount})</span>
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
          Price Range
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceCommit}
            max={maxPrice}
            min={0}
            step={100}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Availability */}
      <div className="flex items-center space-x-2 py-2">
        <Checkbox
          id="in-stock"
          checked={filters.inStock || false}
          onCheckedChange={(checked) => handleInStockChange(checked as boolean)}
        />
        <Label htmlFor="in-stock" className="font-normal cursor-pointer">
          In stock only
        </Label>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden bg-transparent">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">Active</span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FiltersContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Filters */}
      <aside className="hidden lg:block w-64 shrink-0">
        <h2 className="font-semibold text-lg mb-4">Filters</h2>
        <FiltersContent />
      </aside>
    </>
  )
}
