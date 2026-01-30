import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CategoryPageContent } from "@/components/category/category-page-content"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { getCategoryBySlug, getProductsByCategory, getBrands } from "@/lib/data"
import { getCategoryIcon } from "@/lib/category-icons"
import type { AnimalType, Brand } from "@/lib/types"

const ANIMAL_TYPE: AnimalType = "dog"
const ANIMAL_NAME = "Dogs"

interface SubcategoryPageProps {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { subcategorySlug } = await params
  const subcategory = await getCategoryBySlug(subcategorySlug)

  if (!subcategory) {
    return { title: "Category Not Found | Petsmania" }
  }

  return {
    title: `${subcategory.name} - ${ANIMAL_NAME} | Petsmania`,
    description: subcategory.description,
  }
}

export default async function DogSubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
  const { categorySlug, subcategorySlug } = await params
  const resolvedSearchParams = await searchParams

  console.log("[DogSubcategoryPage] Loading subcategory:", subcategorySlug)

  let subcategory = await getCategoryBySlug(subcategorySlug)
  let brands: Brand[] = []
  
  try {
    const result = await Promise.all([getCategoryBySlug(subcategorySlug), getBrands()])
    subcategory = result[0]
    brands = result[1]
  } catch (err) {
    console.error("[DogSubcategoryPage] Error fetching data:", err)
    if (!subcategory) {
      subcategory = await getCategoryBySlug(subcategorySlug)
    }
    try {
      brands = await getBrands()
    } catch (bErr) {
      console.error("[DogSubcategoryPage] Failed to fetch brands:", bErr)
      brands = []
    }
  }

  if (!subcategory) {
    notFound()
  }

  const productsResult = await getProductsByCategory(subcategorySlug)

  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: ANIMAL_NAME, href: `/dogs` },
    { label: "Categories", href: `/dogs/categories` },
  ]
  
  if (subcategory.parentId && subcategory.parentName && subcategory.parentSlug) {
    breadcrumbItems.push({
      label: subcategory.parentName,
      href: `/dogs/${subcategory.parentSlug}`,
    })
  }
  
  breadcrumbItems.push({ label: subcategory.name })

  const Icon = getCategoryIcon(subcategory.slug)

  return (
    <>
      <CartDrawer />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <CategoryPageContent
          category={subcategory}
          initialProducts={productsResult.data}
          brands={brands}
          totalProducts={productsResult.total}
          animalType={ANIMAL_TYPE}
        />
      </div>
    </>
  )
}
