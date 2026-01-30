import { getBrands, getFeaturedProducts } from "@/lib/data"
import { HomeContent } from "@/components/home/home-content"

export default async function HomePage() {
  const [brands, featuredProducts] = await Promise.all([
    getBrands(),
    getFeaturedProducts(),
  ])

  return <HomeContent brands={brands} featuredProducts={featuredProducts} />
}
