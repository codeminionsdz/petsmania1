import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CategoryLayout } from "@/components/category/category-layout"
import { getCategoryBySlug, getProductsByCategory, getBrands } from "@/lib/data"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return { title: "Catégorie Non Trouvée | Petsmania" }
  }

  return {
    title: `${category.name} | Petsmania`,
    description: category.description,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const animalFilter = resolvedSearchParams?.animal as string | undefined

  console.log("[CategoryPage] Loading category with slug:", slug)

  let category = await getCategoryBySlug(slug)
  let brands = []

  try {
    const result = await Promise.all([getCategoryBySlug(slug), getBrands()])
    category = result[0]
    brands = result[1]
  } catch (err) {
    console.error("[CategoryPage] Error fetching category or brands:", err)
    if (!category) {
      category = await getCategoryBySlug(slug)
    }
    try {
      brands = await getBrands()
    } catch (bErr) {
      console.error("[CategoryPage] Failed to fetch brands:", bErr)
      brands = []
    }
  }

  if (!category) {
    notFound()
  }

  console.log("[CategoryPage] Category loaded:", {
    id: category.id,
    name: category.name,
    parentId: category.parentId,
    hasChildren: category.children?.length || 0,
  })

  // Determine if this is a main category or subcategory
  const isMainCategory = !category.parentId
  const isSubcategory = !!category.parentId

  // Fetch products for this category
  const productsResult = await getProductsByCategory(slug)
  console.log("[CategoryPage] Products loaded:", { total: productsResult.total, count: productsResult.data.length })

  // Build breadcrumbs
  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: "Catégories", href: "/categories" },
  ]

  // If this is a subcategory, add parent to breadcrumbs
  let parentCategory: (typeof category & { children: typeof category[] }) | undefined
  if (isSubcategory && category.parentSlug) {
    breadcrumbItems.push({
      label: category.parentName || "Catégorie",
      href: `/categories/${category.parentSlug}`,
    })

    // Fetch parent category for tab navigation
    const parentData = await getCategoryBySlug(category.parentSlug)
    if (parentData) {
      parentCategory = {
        ...parentData,
        children: parentData.children || [],
      }
    }
  }

  // Add current category to breadcrumbs
  breadcrumbItems.push({ label: category.name })

  return (
    <CategoryLayout
      currentCategory={category}
      products={productsResult.data}
      brands={brands}
      totalProducts={productsResult.total}
      parentCategory={parentCategory}
      animalFilter={animalFilter}
      breadcrumbItems={breadcrumbItems}
    />
  )
}
