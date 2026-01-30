"use client"

import { useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { HierarchicalFilter } from "@/components/filters/hierarchical-filter"
import { formatPrice } from "@/lib/format"
import type { Brand, Category, FilterOptions, AnimalType, Subcategory } from "@/lib/types"

const ANIMALS = [
  { value: "cat", label: "Chats", emoji: "🐱" },
  { value: "dog", label: "Chiens", emoji: "🐕" },
  { value: "bird", label: "Oiseaux", emoji: "🐦" },
  { value: "other", label: "Autres", emoji: "🐾" },
] as const

interface ProductFiltersProps {
  categories?: Category[]
  subcategories?: Subcategory[]
  brands?: Brand[]
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
  maxPrice?: number
}

export function ProductFilters({
  categories = [],
  subcategories = [],
  brands = [],
  filters,
  onFilterChange,
  maxPrice = 50000,
}: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([filters.minPrice || 0, filters.maxPrice || maxPrice])

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
    (filters.subcategories && filters.subcategories.length > 0) ||
    (filters.brands && filters.brands.length > 0) ||
    (filters.animalType) ||
    (filters.animalTypes && filters.animalTypes.length > 0) ||
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

      {/* Hierarchical Filter: Animal → Category → Subcategory → Brand */}
      <HierarchicalFilter
        animals={ANIMALS as Array<{ value: AnimalType; label: string; emoji: string }>}
        allCategories={categories}
        allSubcategories={subcategories}
        allBrands={brands}
        filters={filters}
        onFilterChange={onFilterChange}
      />

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
          Price Range
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
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
          <div className="mt-6 overflow-y-auto max-h-[90vh]">
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
