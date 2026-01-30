import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CategoryPageContent } from "@/components/category/category-page-content"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { SubcategoryCard } from "@/components/category/subcategory-card"
import { getCategoryBySlug, getProductsByCategory, getBrands } from "@/lib/data"
import { getCategoryIcon } from "@/lib/category-icons"
import type { AnimalType, Brand } from "@/lib/types"

const ANIMAL_TYPE: AnimalType = "cat"
const ANIMAL_NAME = "Cats"

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params
  const category = await getCategoryBySlug(categorySlug)

  if (!category) {
    return { title: "Category Not Found | Petsmania" }
  }

  return {
    title: `${category.name} - ${ANIMAL_NAME} | Petsmania`,
    description: category.description,
  }
}

export default async function CatCategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categorySlug } = await params
  const resolvedSearchParams = await searchParams

  console.log("[CatCategoryPage] Loading category:", categorySlug)

  let category = await getCategoryBySlug(categorySlug)
  let brands: Brand[] = []
  
  try {
    const result = await Promise.all([getCategoryBySlug(categorySlug), getBrands()])
    category = result[0]
    brands = result[1]
  } catch (err) {
    console.error("[CatCategoryPage] Error fetching data:", err)
    if (!category) {
      category = await getCategoryBySlug(categorySlug)
    }
    try {
      brands = await getBrands()
    } catch (bErr) {
      console.error("[CatCategoryPage] Failed to fetch brands:", bErr)
      brands = []
    }
  }

  if (!category) {
    notFound()
  }

  const productsResult = await getProductsByCategory(categorySlug)

  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: ANIMAL_NAME, href: `/cats` },
    { label: "Categories", href: `/cats/categories` },
  ]
  
  if (category.parentId && category.parentName && category.parentSlug) {
    breadcrumbItems.push({
      label: category.parentName,
      href: `/cats/${category.parentSlug}`,
    })
  }
  
  breadcrumbItems.push({ label: category.name })

  const isMainCategory = !category.parentId && category.children && category.children.length > 0
  const Icon = getCategoryIcon(category.slug)

  return (
    <>
      <CartDrawer />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        {isMainCategory ? (
          <div className="space-y-8">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-border">
              <div className="px-6 py-10 md:px-12 md:py-14 flex items-center gap-6">
                <div className="p-5 rounded-full bg-primary/10 text-primary">
                  <Icon className="h-12 w-12 md:h-16 md:w-16" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{category.name}</h1>
                  <p className="text-muted-foreground max-w-2xl">{category.description}</p>
                  <p className="text-sm text-muted-foreground mt-2">{category.children?.length} subcategories</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {category.children?.map((sub) => (
                  <SubcategoryCard 
                    key={sub.id} 
                    subcategory={sub}
                    animalType={ANIMAL_TYPE}
                  />
                ))}
              </div>
            </div>

            {productsResult.total > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  All {category.name} Products ({productsResult.total})
                </h2>
                <CategoryPageContent
                  category={category}
                  initialProducts={productsResult.data}
                  brands={brands}
                  totalProducts={productsResult.total}
                  animalType={ANIMAL_TYPE}
                />
              </div>
            )}
          </div>
        ) : (
          <CategoryPageContent
            category={category}
            initialProducts={productsResult.data}
            brands={brands}
            totalProducts={productsResult.total}
            animalType={ANIMAL_TYPE}
          />
        )}
      </div>
    </>
  )
}
