import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { ProductDetails } from "@/components/product/product-details"
import { ProductCard } from "@/components/product/product-card"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { getProductBySlug, getRelatedProducts } from "@/lib/data"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Product Not Found" }

  return {
    title: `${product.name} | PharmaCare`,
    description: product.shortDescription,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id)

  return (
    <>
      <CartDrawer />

      {/* Breadcrumbs */}
      <nav className="bg-secondary py-3">
        <div className="container mx-auto px-4">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li>
              <Link
                href={`/categories/${product.categoryName?.toLowerCase().replace(/\s+/g, "-") || product.categoryId}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {product.categoryName}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li className="text-foreground font-medium truncate max-w-[200px]">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* Product Details */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <ProductDetails product={product} />
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
