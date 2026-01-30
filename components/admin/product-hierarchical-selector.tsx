"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { AnimalType, Category, Brand, Subcategory } from "@/lib/types"

interface ProductHierarchicalSelectorProps {
  animals: Array<{ value: AnimalType; label: string }>
  categories: Category[]
  subcategories: Subcategory[]
  brands: Brand[]
  onSelectionChange: (selection: ProductHierarchicalSelection) => void
  loading?: boolean
}

export interface ProductHierarchicalSelection {
  animalId: AnimalType | ""
  categoryId: string
  subcategoryId: string
  brandId: string
}

/**
 * Hierarchical selector for admin product creation
 * Enforces: Animal → Category → Subcategory → Brand
 * Prevents invalid combinations
 */
export function ProductHierarchicalSelector({
  animals,
  categories: allCategories,
  subcategories: allSubcategories,
  brands: allBrands,
  onSelectionChange,
  loading = false,
}: ProductHierarchicalSelectorProps) {
  const [selection, setSelection] = useState<ProductHierarchicalSelection>({
    animalId: "",
    categoryId: "",
    subcategoryId: "",
    brandId: "",
  })

  // Filtered lists based on hierarchy
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([])
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([])

  // Update categories when animal changes
  useEffect(() => {
    if (selection.animalId) {
      console.log("[ProductHierarchicalSelector] Animal selected:", selection.animalId)
      console.log("[ProductHierarchicalSelector] Total categories:", allCategories.length)
      
      // Filter categories for this animal (include universal)
      const relevant = allCategories.filter(
        (cat) => {
          const isMainCategory = !cat.parentId
          const matchesAnimal = cat.animal_type === selection.animalId || !cat.animal_type
          const match = isMainCategory && matchesAnimal
          
          if (match) {
            console.log("[ProductHierarchicalSelector] Matching category:", cat.name, "animal_type:", cat.animal_type)
          }
          return match
        }
      )
      
      console.log("[ProductHierarchicalSelector] Filtered categories:", relevant.length, relevant)
      setAvailableCategories(relevant)

      // Clear dependent selections
      setSelection((prev) => ({
        ...prev,
        categoryId: "",
        subcategoryId: "",
        brandId: "",
      }))
    } else {
      setAvailableCategories([])
      setSelection((prev) => ({
        ...prev,
        categoryId: "",
        subcategoryId: "",
        brandId: "",
      }))
    }
  }, [selection.animalId, allCategories])

  // Update subcategories when category changes
  useEffect(() => {
    if (selection.categoryId && selection.animalId) {
      console.log("\n[ProductHierarchicalSelector] ========== SUBCATEGORIES DEBUG ==========")
      console.log("[ProductHierarchicalSelector] Category selected:", selection.categoryId)
      console.log("[ProductHierarchicalSelector] Animal selected:", selection.animalId)
      console.log("[ProductHierarchicalSelector] Total subcategories available:", allSubcategories.length)
      console.log("[ProductHierarchicalSelector] All subcategories data:", allSubcategories)
      
      // Get ALL subcategories for this category (don't filter by animal_type, show all)
      // The animal_type is for display purposes, not filtering
      const relevant = allSubcategories.filter(
        (sub) => {
          const categoryMatch = sub.category_id === selection.categoryId
          
          console.log(`[ProductHierarchicalSelector] Subcategory: "${sub.name}"`)
          console.log(`  - category_id: ${sub.category_id} (expected: ${selection.categoryId}) - ${categoryMatch ? '✓' : '✗'}`)
          console.log(`  - animal_type: ${sub.animal_type}`)
          console.log(`  - MATCH: ${categoryMatch ? '✓' : '✗'}`)
          
          return categoryMatch
        }
      )
      
      console.log("[ProductHierarchicalSelector] Filtered subcategories count:", relevant.length)
      console.log("[ProductHierarchicalSelector] Filtered subcategories:", relevant)
      console.log("[ProductHierarchicalSelector] ======================================\n")
      
      setAvailableSubcategories(relevant)

      // Clear dependent selections
      setSelection((prev) => ({
        ...prev,
        subcategoryId: "",
        brandId: "",
      }))
    } else {
      setAvailableSubcategories([])
      setSelection((prev) => ({
        ...prev,
        subcategoryId: "",
        brandId: "",
      }))
    }
  }, [selection.categoryId, selection.animalId, allSubcategories])

  // Update brands when subcategory changes (or category if no subcategories)
  useEffect(() => {
    if (selection.animalId) {
      // Filter brands that have products matching current selections
      // For now, show all brands for the animal
      // In production, filter by actual products available
      const relevant = allBrands.filter(
        (brand) =>
          !brand.animalTypes || // Universal brand
          (brand.animalTypes && brand.animalTypes.includes(selection.animalId as AnimalType))
      )
      setAvailableBrands(relevant)

      // Keep selected brand if still available, otherwise clear
      if (selection.brandId && !relevant.some((b) => b.id === selection.brandId)) {
        setSelection((prev) => ({
          ...prev,
          brandId: "",
        }))
      }
    } else {
      setAvailableBrands([])
      setSelection((prev) => ({
        ...prev,
        brandId: "",
      }))
    }
  }, [selection.animalId, selection.categoryId, selection.subcategoryId, allBrands])

  // Notify parent on selection change
  useEffect(() => {
    onSelectionChange(selection)
  }, [selection])

  const handleAnimalChange = (value: string) => {
    setSelection((prev) => ({
      ...prev,
      animalId: (value || "") as AnimalType | "",
    }))
  }

  const handleCategoryChange = (value: string) => {
    setSelection((prev) => ({
      ...prev,
      categoryId: value,
    }))
  }

  const handleSubcategoryChange = (value: string) => {
    console.log("[ProductHierarchicalSelector] Subcategory selected:", value)
    
    // Find the selected subcategory to get its parent category
    const selectedSub = availableSubcategories.find(s => s.id === value)
    console.log("[ProductHierarchicalSelector] Selected subcategory details:", selectedSub)
    
    if (selectedSub) {
      // The parent category ID is stored in category_id
      const parentCategoryId = selectedSub.category_id || selectedSub.categoryId
      console.log("[ProductHierarchicalSelector] Parent category from subcategory:", parentCategoryId)
      
      setSelection((prev) => ({
        ...prev,
        categoryId: parentCategoryId,  // Set the parent category
        subcategoryId: value,  // Set the subcategory
      }))
    } else {
      setSelection((prev) => ({
        ...prev,
        subcategoryId: value,
      }))
    }
  }

  const handleBrandChange = (value: string) => {
    setSelection((prev) => ({
      ...prev,
      brandId: value,
    }))
  }

  return (
    <div className="space-y-4">
      {/* Step 1: Animal Selection */}
      <div className="space-y-2">
        <Label htmlFor="animal">Animal *</Label>
        <Select value={selection.animalId} onValueChange={handleAnimalChange} disabled={loading}>
          <SelectTrigger id="animal">
            <SelectValue placeholder="Sélectionner un animal" />
          </SelectTrigger>
          <SelectContent>
            {animals.map((animal) => (
              <SelectItem key={animal.value} value={animal.value}>
                {animal.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          L'animal détermine les catégories disponibles
        </p>
      </div>

      {/* Step 2: Category Selection */}
      <div className="space-y-2">
        <Label htmlFor="category">Catégorie *</Label>
        <Select
          value={selection.categoryId}
          onValueChange={handleCategoryChange}
          disabled={!selection.animalId || availableCategories.length === 0 || loading}
        >
          <SelectTrigger id="category">
            <SelectValue
              placeholder={
                !selection.animalId
                  ? "Sélectionnez d'abord un animal"
                  : availableCategories.length === 0
                  ? "Aucune catégorie disponible"
                  : "Sélectionner une catégorie"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!selection.animalId && (
          <p className="text-xs text-muted-foreground">Choisissez un animal d'abord</p>
        )}
      </div>

      {/* Step 3: Subcategory Selection - Using RadioGroup for better visibility */}
      {selection.categoryId && (
        <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <Label className="font-semibold">Sous-catégorie</Label>
          
          {availableSubcategories.length === 0 ? (
            <div className="text-sm text-amber-600">
              Aucune sous-catégorie disponible pour cette catégorie
            </div>
          ) : (
            <RadioGroup 
              value={selection.subcategoryId} 
              onValueChange={handleSubcategoryChange}
            >
              <div className="space-y-2">
                {availableSubcategories.map((sub) => (
                  <div key={sub.id} className="flex items-center space-x-2 p-2 rounded hover:bg-white transition-colors">
                    <RadioGroupItem 
                      value={sub.id} 
                      id={`subcat-${sub.id}`}
                    />
                    <Label 
                      htmlFor={`subcat-${sub.id}`}
                      className="cursor-pointer flex-1 font-normal"
                    >
                      {sub.name || `[Sans nom: ${sub.id.slice(0, 8)}]`}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
          
          {selection.subcategoryId && (
            <p className="text-xs text-green-600 font-semibold">
              ✓ {availableSubcategories.find(s => s.id === selection.subcategoryId)?.name} sélectionnée
            </p>
          )}
        </div>
      )}

      {/* Step 4: Brand Selection */}
      <div className="space-y-2">
        <Label htmlFor="brand">Marque</Label>
        <Select
          value={selection.brandId}
          onValueChange={handleBrandChange}
          disabled={!selection.animalId || availableBrands.length === 0 || loading}
        >
          <SelectTrigger id="brand">
            <SelectValue
              placeholder={
                !selection.animalId
                  ? "Sélectionnez d'abord un animal"
                  : availableBrands.length === 0
                  ? "Aucune marque disponible"
                  : "Sélectionner une marque (optionnel)"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {availableBrands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Les marques disponibles dépendent de l'animal sélectionné
        </p>
      </div>

      {/* Validation Summary */}
      {selection.animalId && selection.categoryId && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-sm">
            <strong>Sélection actuelle:</strong>{" "}
            {animals.find((a) => a.value === selection.animalId)?.label} →{" "}
            {allCategories.find((c) => c.id === selection.categoryId)?.name}
            {selection.subcategoryId &&
              ` → ${allSubcategories.find((s) => s.id === selection.subcategoryId)?.name}`}
            {selection.brandId &&
              ` → ${allBrands.find((b) => b.id === selection.brandId)?.name}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Invalid Combination Warning */}
      {selection.animalId && !selection.categoryId && availableCategories.length === 0 && (
        <Alert variant="destructive">
          <AlertDescription className="text-sm">
            Aucune catégorie disponible pour l'animal sélectionné. Vérifiez la configuration des catégories.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
