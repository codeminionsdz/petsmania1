import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { getCategoriesForAnimal, validateAnimalContext } from "@/lib/data"
import type { AnimalType } from "@/lib/types"

const ANIMAL_TYPE: AnimalType = "dog"
const ANIMAL_NAME = "Dogs"
const ANIMAL_EMOJI = "🐕"

// Validate animal context at page level
validateAnimalContext(ANIMAL_TYPE)

export const metadata: Metadata = {
  title: `${ANIMAL_NAME} Categories | PharmaCare`,
  description: `Browse all product categories for ${ANIMAL_NAME.toLowerCase()}`,
}

export default async function DogCategoriesPage() {
  const categories = await getCategoriesForAnimal(ANIMAL_TYPE)

  return (
    <>
      <CartDrawer />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Categories", href: "/categories" },
            { label: ANIMAL_NAME },
          ]}
        />

        <div className="mb-12">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Animals
          </Link>

          <div className="space-y-2">
            <div className="text-5xl">{ANIMAL_EMOJI}</div>
            <h1 className="text-4xl md:text-5xl font-bold">{ANIMAL_NAME} Categories</h1>
            <p className="text-muted-foreground text-lg">
              Select a category to browse products for {ANIMAL_NAME.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/dogs/${category.slug}`}
                  className="group relative overflow-hidden rounded-lg border-2 border-border bg-card p-6 transition-all duration-300 hover:border-primary hover:shadow-lg"
                >
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}

                    <div className="flex items-center gap-2 pt-2 text-primary opacity-0 transition-all group-hover:opacity-100">
                      <span className="text-sm font-medium">View Products</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Hover effect background */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No categories available yet for {ANIMAL_NAME.toLowerCase()}</p>
          </div>
        )}
      </div>
    </>
  )
}
