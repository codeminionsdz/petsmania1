"use client"

import { CartDrawer } from "@/components/cart/cart-drawer"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { CategoryPageContent } from "@/components/category/category-page-content"
import { SubcategoryTabs } from "@/components/category/subcategory-tabs"
import { getCategoryIcon } from "@/lib/category-icons"
import type { Category, Product, Brand, AnimalType } from "@/lib/types"

interface CategoryLayoutProps {
  /**
   * Currently viewed category/subcategory
   */
  currentCategory: Category

  /**
   * All products to display
   */
  products: Product[]

  /**
   * All available brands
   */
  brands: Brand[]

  /**
   * Total product count (for pagination)
   */
  totalProducts: number

  /**
   * Parent category (if this is a subcategory)
   * Used to show tabs for switching between siblings
   */
  parentCategory?: Category & { children: Category[] }

  /**
   * Optional animal filter from search params
   */
  animalFilter?: string

  /**
   * Breadcrumb items to display
   */
  breadcrumbItems: Array<{ label: string; href?: string }>

  /**
   * Animal type for the category (defaults to 'cat')
   */
  animalType?: AnimalType
}

export function CategoryLayout({
  currentCategory,
  products,
  brands,
  totalProducts,
  parentCategory,
  animalFilter,
  breadcrumbItems,
  animalType = "cat",
}: CategoryLayoutProps) {
  const Icon = getCategoryIcon(currentCategory.slug)

  return (
    <>
      <CartDrawer />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Category Header */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-border mb-8">
          <div className="px-6 py-10 md:px-12 md:py-14 flex items-center gap-6">
            <div className="p-5 rounded-full bg-primary/10 text-primary">
              <Icon className="h-12 w-12 md:h-16 md:w-16" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {parentCategory ? parentCategory.name : currentCategory.name}
              </h1>
              <p className="text-muted-foreground max-w-2xl">{parentCategory ? parentCategory.description : currentCategory.description}</p>
            </div>
          </div>
        </div>

        {/* Subcategory Navigation Tabs (if parent category exists) */}
        {parentCategory && parentCategory.children && parentCategory.children.length > 0 && (
          <div className="mb-8">
            <SubcategoryTabs
              parentCategory={parentCategory}
              currentSubcategory={currentCategory}
              layout="tabs"
            />
          </div>
        )}

        {/* Products Grid */}
        <CategoryPageContent
          category={currentCategory}
          initialProducts={products}
          brands={brands}
          totalProducts={totalProducts}
          animalType={animalType}
          initialAnimalFilter={animalFilter}
        />
      </div>
    </>
  )
}
