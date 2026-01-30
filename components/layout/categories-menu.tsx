"use client"

import { useState } from "react"
import Link from "next/link"
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import type { Category, AnimalType } from "@/lib/types"
import { getCategoryIcon } from "@/lib/category-icons"

interface CategoriesMenuProps {
  categories?: Category[]
}

const ANIMALS = [
  { value: "cat" as AnimalType, label: "🐱 Chats", slug: "cats" },
  { value: "dog" as AnimalType, label: "🐕 Chiens", slug: "dogs" },
  { value: "bird" as AnimalType, label: "🐦 Oiseaux", slug: "birds" },
  { value: "other" as AnimalType, label: "🐾 Autres", slug: "other" },
] as const

export function CategoriesMenu({ categories = [] }: CategoriesMenuProps) {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null)
  const hasCategories = categories.length > 0

  // Filter categories by selected animal (if any)
  const filteredCategories = selectedAnimal
    ? categories.filter(
        (cat) =>
          cat.animal_type === selectedAnimal ||
          cat.animal_type === null ||
          !cat.animal_type
      )
    : categories

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="font-medium text-base">
        Catégories
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="w-[1100px] p-8">
          {!hasCategories ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Animal Filter Tabs */}
              <div className="flex items-center gap-3 border-b border-border pb-6">
                <span className="text-sm font-semibold text-muted-foreground">Filtre par animal:</span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedAnimal(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedAnimal === null
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                    }`}
                  >
                    ✨ Tout voir
                  </button>
                  {ANIMALS.map((animal) => (
                    <button
                      key={animal.value}
                      onClick={() => setSelectedAnimal(animal.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedAnimal === animal.value
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                      }`}
                    >
                      {animal.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories Grid */}
              {filteredCategories.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {filteredCategories.map((category) => {
                    const Icon = getCategoryIcon(category.slug)
                    return (
                      <div
                        key={category.id}
                        className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background via-background to-primary/5 p-5 transition-all duration-300 hover:shadow-xl hover:border-primary/50 hover:scale-[1.03] hover:-translate-y-1"
                      >
                        {/* Icon Background */}
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-all duration-300 blur-xl" />

                        {/* Content */}
                        <Link
                          href={
                            // If category has subcategories, navigate to the first one
                            category.children && category.children.length > 0
                              ? `/categories/${category.children[0].slug}`
                              : `/categories/${category.slug}`
                          }
                          className="relative block"
                        >
                          <div className="flex items-start gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-200">
                                {category.name}
                              </h3>
                            </div>
                          </div>

                          {category.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                              {category.description}
                            </p>
                          )}
                        </Link>

                        {/* Subcategories */}
                        {category.children && category.children.length > 0 && (
                          <div className="border-t border-border/50 pt-3">
                            <ul className="space-y-1.5">
                              {category.children.slice(0, 3).map((sub) => (
                                <li key={sub.id}>
                                  <Link
                                    href={`/categories/${sub.slug}`}
                                    className="text-xs block py-1.5 px-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 truncate"
                                  >
                                    • {sub.name}
                                  </Link>
                                </li>
                              ))}
                              {category.children.length > 3 && (
                                <li>
                                  <Link
                                    href={`/categories/${category.children[0].slug}`}
                                    className="text-xs block py-1.5 px-2 rounded-lg font-semibold text-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-1"
                                  >
                                    <span>+{category.children.length - 3}</span>
                                    <span>→</span>
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">لا توجد فئات لهذا الحيوان</p>
                </div>
              )}

              {/* Footer Link */}
              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-all duration-200 group"
                >
                  <span>عرض جميع الفئات</span>
                  <span className="text-lg group-hover:translate-x-1 transition-transform duration-200">→</span>
                </Link>
                
                {selectedAnimal && (
                  <div className="text-xs text-muted-foreground">
                    تصفية حسب: <span className="font-semibold">{ANIMALS.find(a => a.value === selectedAnimal)?.label}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}
