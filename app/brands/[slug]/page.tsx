import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ProductGrid } from "@/components/product/product-grid"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { getBrandBySlug, getProductsByBrand } from "@/lib/data"

interface BrandPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)

  if (!brand) {
    return { title: "Marque Non Trouvée | PharmaCare" }
  }

  return {
    title: `Produits ${brand.name} | PharmaCare`,
    description: brand.description,
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)

  if (!brand) {
    notFound()
  }

  const productsResponse = await getProductsByBrand(slug)
  const products = productsResponse.data

  return (
    <>
      <CartDrawer />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Marques", href: "/brands" }, { label: brand.name }]} />

        {/* Brand Header */}
        <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
          <div className="w-32 h-32 md:w-40 md:h-40 relative bg-secondary rounded-lg p-4 shrink-0">
            <Image
              src={brand.logo || "/placeholder.svg?height=160&width=160&query=brand logo"}
              alt={brand.name}
              fill
              className="object-contain p-4"
            />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{brand.name}</h1>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">{brand.description}</p>
            <p className="mt-4 text-sm text-muted-foreground">{productsResponse.total} produits disponibles</p>
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Tous les Produits {brand.name}</h2>
          <ProductGrid products={products} emptyMessage={`Aucun produit trouvé pour ${brand.name}.`} />
        </div>
      </div>
    </>
  )
}
