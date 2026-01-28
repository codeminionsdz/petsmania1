import { getCategoriesWithHierarchy, getBrands, getFeaturedProducts } from "@/lib/data"
import { HomeContent } from "@/components/home/home-content"

export default async function HomePage() {
  const [categories, brands, featuredProducts] = await Promise.all([
    getCategoriesWithHierarchy(),
    getBrands(),
    getFeaturedProducts(),
  ])

  return <HomeContent categories={categories} brands={brands} featuredProducts={featuredProducts} />
}
