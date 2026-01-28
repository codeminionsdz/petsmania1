import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { MainCategoryCard } from "@/components/category/main-category-card"
import { SubcategoryCard } from "@/components/category/subcategory-card"
import { getCategoriesWithHierarchy } from "@/lib/data"

export const metadata: Metadata = {
  title: "Toutes les Catégories | PharmaCare",
  description:
    "Parcourez toutes nos catégories de produits parapharmaceutiques - visage, cheveux, corps, santé et plus.",
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithHierarchy()

  return (
    <>
      <CartDrawer />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Catégories" }]} />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Toutes les Catégories</h1>
          <p className="text-muted-foreground mt-2">Découvrez notre gamme complète de produits parapharmaceutiques</p>
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Nos Catégories Principales</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <MainCategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        <div className="space-y-12">
          {categories.map((category) => (
            <section key={category.id} className="space-y-4">
              {/* Main Category Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <Link href={`/categories/${category.slug}`} className="group flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h2>
                  <ArrowRight className="h-5 w-5 text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </Link>
                <span className="text-sm text-muted-foreground">{category.children?.length || 0} sous-catégories</span>
              </div>

              {/* Subcategories Grid with photos */}
              {category.children && category.children.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {category.children.map((sub) => (
                    <SubcategoryCard key={sub.id} subcategory={sub} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
