import type { Metadata } from "next"
import { BrandCard } from "@/components/brand/brand-card"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { getBrands } from "@/lib/data"

export const metadata: Metadata = {
  title: "All Brands | Petsmania",
  description: "Shop from trusted pet product brands - premium quality pet food, toys, and accessories from top European manufacturers.",
}

export default async function BrandsPage() {
  const brands = await getBrands()

  return (
    <>
      <CartDrawer />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Brands" }]} />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Our Brands</h1>
          <p className="text-muted-foreground mt-2">
            We partner with the world's most trusted pet product brands and manufacturers
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search brands..." className="pl-10" />
        </div>

        {/* Featured Brands */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Featured Brands</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {brands
              .filter((b) => b.featured)
              .map((brand) => (
                <BrandCard key={brand.id} brand={brand} />
              ))}
          </div>
        </div>

        {/* All Brands */}
        <div>
          <h2 className="text-xl font-semibold mb-4">All Brands</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
