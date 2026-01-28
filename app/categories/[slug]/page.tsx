import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CategoryPageContent } from "@/components/category/category-page-content"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { SubcategoryCard } from "@/components/category/subcategory-card"
import { getCategoryBySlug, getProductsByCategory, getBrands } from "@/lib/data"
import { getCategoryIcon } from "@/lib/category-icons"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return { title: "Catégorie Non Trouvée | PharmaCare" }
  }

  return {
    title: `${category.name} | PharmaCare`,
    description: category.description,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  const [category, brands] = await Promise.all([getCategoryBySlug(slug), getBrands()])

  if (!category) {
    notFound()
  }

  const productsResult = await getProductsByCategory(slug)

  const breadcrumbItems = [{ label: "Catégories", href: "/categories" }]
  if (category.parentId && category.parentName && category.parentSlug) {
    breadcrumbItems.push({
      label: category.parentName,
      href: `/categories/${category.parentSlug}`,
    })
  }
  breadcrumbItems.push({ label: category.name })

  // Check if this is a main category with subcategories
  const isMainCategory = !category.parentId && category.children && category.children.length > 0
  const Icon = getCategoryIcon(category.slug)

  return (
    <>
      <CartDrawer />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        {/* If main category, show subcategories grid first */}
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
                  <p className="text-sm text-muted-foreground mt-2">{category.children?.length} sous-catégories</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Sous-catégories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {category.children?.map((sub) => (
                  <SubcategoryCard key={sub.id} subcategory={sub} />
                ))}
              </div>
            </div>

            {/* Products Section (if any) */}
            {productsResult.total > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Tous les produits {category.name} ({productsResult.total})
                </h2>
                <CategoryPageContent
                  category={category}
                  initialProducts={productsResult.data}
                  brands={brands}
                  totalProducts={productsResult.total}
                />
              </div>
            )}
          </div>
        ) : (
          /* Regular subcategory page with products */
          <CategoryPageContent
            category={category}
            initialProducts={productsResult.data}
            brands={brands}
            totalProducts={productsResult.total}
          />
        )}
      </div>
    </>
  )
}
