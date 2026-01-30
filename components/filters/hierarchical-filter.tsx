"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Category, Brand, FilterOptions, AnimalType, Subcategory } from "@/lib/types"

interface HierarchicalFilterProps {
  animals: Array<{ value: AnimalType; label: string; emoji: string }>
  allCategories: Category[]
  allSubcategories: Subcategory[]
  allBrands: Brand[]
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
}

interface FilterState {
  selectedAnimal: AnimalType | null
  selectedCategories: string[]
  selectedSubcategories: string[]
  selectedBrands: string[]
}

export function HierarchicalFilter({
  animals,
  allCategories,
  allSubcategories,
  allBrands,
  filters,
  onFilterChange,
}: HierarchicalFilterProps) {
  const [state, setState] = useState<FilterState>({
    selectedAnimal: (filters.animalType || filters.animalTypes?.[0]) as AnimalType | null,
    selectedCategories: filters.categories || [],
    selectedSubcategories: filters.subcategories || [],
    selectedBrands: filters.brands || [],
  })

  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([])
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([])

  // Track previous values to prevent unnecessary updates
  const prevStateRef = useRef<FilterState | null>(null)
  const isInitialMount = useRef(true)

  // Compute available categories based on selected animal (no setState)
  const computedAvailableCategories = state.selectedAnimal
    ? allCategories.filter(
        (cat) =>
          cat.animal_type === state.selectedAnimal ||
          cat.animal_type === null ||
          cat.animal_type === undefined
      )
    : allCategories

  // Compute available subcategories based on selected categories (no setState)
  const computedAvailableSubcategories = state.selectedCategories.length > 0
    ? allSubcategories.filter((sub) => {
        const matches = state.selectedCategories.includes(sub.category_id)
        const animalMatches =
          !state.selectedAnimal ||
          sub.animal_type === state.selectedAnimal ||
          sub.animal_type === null ||
          sub.animal_type === undefined
        return matches && animalMatches
      })
    : []

  // Only update available categories and subcategories when computed values actually change
  useEffect(() => {
    if (
      JSON.stringify(availableCategories) !== JSON.stringify(computedAvailableCategories)
    ) {
      setAvailableCategories(computedAvailableCategories)
    }
  }, [computedAvailableCategories])

  useEffect(() => {
    if (
      JSON.stringify(availableSubcategories) !== JSON.stringify(computedAvailableSubcategories)
    ) {
      setAvailableSubcategories(computedAvailableSubcategories)
      
      // Filter out invalid subcategories when available list changes
      const validSubcats = state.selectedSubcategories.filter((subId) =>
        computedAvailableSubcategories.some((s) => s.id === subId)
      )
      
      if (JSON.stringify(validSubcats) !== JSON.stringify(state.selectedSubcategories)) {
        setState((prev) => ({
          ...prev,
          selectedSubcategories: validSubcats,
        }))
      }
    }
  }, [computedAvailableSubcategories])

  // Update brands - always show all available brands
  useEffect(() => {
    if (JSON.stringify(availableBrands) !== JSON.stringify(allBrands)) {
      setAvailableBrands(allBrands)
    }
  }, [allBrands])

  // Notify parent only when filter state actually changes (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevStateRef.current = state
      return
    }

    // Only call onFilterChange if state actually changed
    if (JSON.stringify(prevStateRef.current) !== JSON.stringify(state)) {
      const newFilters: FilterOptions = {
        animalType: state.selectedAnimal || undefined,
        categories: state.selectedCategories.length > 0 ? state.selectedCategories : undefined,
        subcategories: state.selectedSubcategories.length > 0 ? state.selectedSubcategories : undefined,
        brands: state.selectedBrands.length > 0 ? state.selectedBrands : undefined,
      }
      onFilterChange(newFilters)
      prevStateRef.current = state
    }
  }, [state, onFilterChange])

  const handleAnimalChange = (animal: AnimalType) => {
    setState((prev) => ({
      ...prev,
      selectedAnimal: prev.selectedAnimal === animal ? null : animal,
      // Do NOT clear categories/subcategories here - let the computed values handle filtering
    }))
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setState((prev) => {
      const updated = checked
        ? [...prev.selectedCategories, categoryId]
        : prev.selectedCategories.filter((id) => id !== categoryId)
      return {
        ...prev,
        selectedCategories: updated,
      }
    })
  }

  const handleSubcategoryChange = (subcategoryId: string, checked: boolean) => {
    setState((prev) => ({
      ...prev,
      selectedSubcategories: checked
        ? [...prev.selectedSubcategories, subcategoryId]
        : prev.selectedSubcategories.filter((id) => id !== subcategoryId),
    }))
  }

  const handleBrandChange = (brandId: string, checked: boolean) => {
    setState((prev) => ({
      ...prev,
      selectedBrands: checked
        ? [...prev.selectedBrands, brandId]
        : prev.selectedBrands.filter((id) => id !== brandId),
    }))
  }

  const handleClear = () => {
    setState({
      selectedAnimal: null,
      selectedCategories: [],
      selectedSubcategories: [],
      selectedBrands: [],
    })
  }

  const hasActiveFilters =
    state.selectedAnimal ||
    state.selectedCategories.length > 0 ||
    state.selectedSubcategories.length > 0 ||
    state.selectedBrands.length > 0

  return (
    <div className="space-y-6">
      {/* Header with Clear Button */}
      {hasActiveFilters && (
        <Button variant="ghost" className="w-full justify-start" onClick={handleClear}>
          <X className="h-4 w-4 mr-2" />
          Clear all filters
        </Button>
      )}

      {/* 1. Animal Selection */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Animal</h3>
        <div className="flex flex-wrap gap-2">
          {animals.map((animal) => (
            <Button
              key={animal.value}
              onClick={() => handleAnimalChange(animal.value)}
              variant={state.selectedAnimal === animal.value ? "default" : "outline"}
              className="flex items-center gap-2 transition-all"
            >
              <span className="text-lg">{animal.emoji}</span>
              <span>{animal.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* 2. Categories - Only shown if animal selected */}
      {state.selectedAnimal && availableCategories.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
            <span>Categories</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {availableCategories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={state.selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`cat-${category.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* 3. Subcategories - Only shown if category selected */}
      {state.selectedCategories.length > 0 && availableSubcategories.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
            <span>Subcategories</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {availableSubcategories.map((subcategory) => (
              <div key={subcategory.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`subcat-${subcategory.id}`}
                  checked={state.selectedSubcategories.includes(subcategory.id)}
                  onCheckedChange={(checked) =>
                    handleSubcategoryChange(subcategory.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`subcat-${subcategory.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {subcategory.name}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* 4. Brands - Always available but filtered by hierarchy */}
      {state.selectedAnimal && availableBrands.length > 0 && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold">
            <span>Brands</span>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {availableBrands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={state.selectedBrands.includes(brand.id)}
                  onCheckedChange={(checked) =>
                    handleBrandChange(brand.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`brand-${brand.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {brand.name}
                </Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Helper Text */}
      {!state.selectedAnimal && (
        <p className="text-xs text-muted-foreground italic">
          Select an animal to view available categories
        </p>
      )}

      {state.selectedAnimal && state.selectedCategories.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          Select a category to view subcategories
        </p>
      )}
    </div>
  )
}
