import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CategoryLayout } from "@/components/category/category-layout"
import { getCategoryBySlug, getProductsByCategory, getBrands } from "@/lib/data"
import type { Brand } from "@/lib/types"

interface SubcategoryPageProps {
  params: Promise<{ slug: string; subSlug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { slug, subSlug } = await params
  const subcategory = await getCategoryBySlug(subSlug)

  if (!subcategory) {
    return { title: "Catégorie Non Trouvée | Petsmania" }
  }

  return {
    title: `${subcategory.name} | Petsmania`,
    description: subcategory.description,
  }
}

export default async function SubcategoryPage({ params, searchParams }: SubcategoryPageProps) {
  const { slug, subSlug } = await params
  const resolvedSearchParams = await searchParams
  const animalFilter = resolvedSearchParams?.animal as string | undefined

  console.log("[SubcategoryPage] Loading subcategory with slug:", subSlug, "parent:", slug)

  let subcategory = await getCategoryBySlug(subSlug)
  let brands: Brand[] = []

  try {
    const result = await Promise.all([getCategoryBySlug(subSlug), getBrands()])
    subcategory = result[0]
    brands = result[1]
  } catch (err) {
    console.error("[SubcategoryPage] Error fetching subcategory or brands:", err)
    if (!subcategory) {
      subcategory = await getCategoryBySlug(subSlug)
    }
    try {
      brands = await getBrands()
    } catch (bErr) {
      console.error("[SubcategoryPage] Failed to fetch brands:", bErr)
      brands = []
    }
  }

  if (!subcategory) {
    notFound()
  }

  // Verify this is actually a subcategory (has a parent)
  if (!subcategory.parentId || !subcategory.parentSlug) {
    console.warn(
      "[SubcategoryPage] Category is not a subcategory (no parent), redirecting to main category page"
    )
    // This URL shouldn't exist - redirect to main category
    notFound()
  }

  console.log("[SubcategoryPage] Subcategory loaded:", {
    id: subcategory.id,
    name: subcategory.name,
    parentId: subcategory.parentId,
  })

  // Fetch products for this subcategory
  const productsResult = await getProductsByCategory(subSlug)
  console.log("[SubcategoryPage] Products loaded:", {
    total: productsResult.total,
    count: productsResult.data.length,
  })

  // Fetch parent category for tab navigation
  const parentData = await getCategoryBySlug(subcategory.parentSlug)
  if (!parentData) {
    notFound()
  }

  const parentCategory = {
    ...parentData,
    children: parentData.children || [],
  }

  // Build breadcrumbs
  const breadcrumbItems: Array<{ label: string; href?: string }> = [
    { label: "Catégories", href: "/categories" },
    {
      label: parentCategory.name,
      href: `/categories/${parentCategory.slug}`,
    },
    { label: subcategory.name },
  ]

  return (
    <CategoryLayout
      currentCategory={subcategory}
      products={productsResult.data}
      brands={brands}
      totalProducts={productsResult.total}
      parentCategory={parentCategory}
      animalFilter={animalFilter}
      breadcrumbItems={breadcrumbItems}
    />
  )
}
