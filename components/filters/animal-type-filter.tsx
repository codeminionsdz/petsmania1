"use client"

import { Button } from "@/components/ui/button"
import type { FilterOptions, AnimalType } from "@/lib/types"

const ANIMAL_TYPES = [
  { value: "all", label: "Tous", emoji: "✨" },
  { value: "cat", label: "Chats", emoji: "🐱" },
  { value: "dog", label: "Chiens", emoji: "🐕" },
  { value: "bird", label: "Oiseaux", emoji: "🐦" },
  { value: "other", label: "Autres", emoji: "🐾" },
]

interface AnimalTypeFilterProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
}

export function AnimalTypeFilter({ filters, onFilterChange }: AnimalTypeFilterProps) {
  const selectedAnimalTypes = (filters.animalTypes || []) as AnimalType[]
  const hasSelection = selectedAnimalTypes.length > 0

  const handleToggle = (animalType: string) => {
    if (animalType === "all") {
      // "All" clears the animal type filter (shows all products including those without animalType)
      onFilterChange({
        ...filters,
        animalTypes: undefined,
      })
    } else {
      const updated = selectedAnimalTypes.includes(animalType as AnimalType)
        ? selectedAnimalTypes.filter((type) => type !== animalType)
        : [...selectedAnimalTypes, animalType as AnimalType]

      onFilterChange({
        ...filters,
        animalTypes: updated.length > 0 ? updated : undefined,
      })
    }
  }

  const handleClear = () => {
    onFilterChange({
      ...filters,
      animalTypes: undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Type d'animal</h3>
        {hasSelection && (
          <button
            onClick={handleClear}
            className="text-xs text-primary hover:underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {ANIMAL_TYPES.map((type) => {
          const isSelected = type.value === "all" ? !hasSelection : selectedAnimalTypes.includes(type.value as AnimalType)
          
          return (
            <Button
              key={type.value}
              onClick={() => handleToggle(type.value)}
              variant={isSelected ? "default" : "outline"}
              className="flex items-center gap-2 transition-all"
            >
              <span className="text-lg">{type.emoji}</span>
              <span>{type.label}</span>
            </Button>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Les produits sans type d'animal spécifié apparaissent dans tous les filtres
      </p>
    </div>
  )
}
