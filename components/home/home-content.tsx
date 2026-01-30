"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { MainCategoryCard } from "@/components/category/main-category-card"
import { BrandCard } from "@/components/brand/brand-card"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { HeroCarousel } from "@/components/layout/hero-carousel"
import { AnimalCategoriesSection } from "@/components/home/animal-categories-section"
import { useTranslation } from "@/hooks/use-translation"
import type { Product, Brand } from "@/lib/types"

interface HomeContentProps {
  brands: Brand[]
  featuredProducts: Product[]
}

export function HomeContent({ brands, featuredProducts }: HomeContentProps) {
  const { t } = useTranslation()

  return (
    <>
      <CartDrawer />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Animal Selection - PRIMARY ENTRY POINT */}
      <AnimalCategoriesSection />

      {/* Categories Section - Now showing categories for each animal */}
      {/* Removed: This section is now replaced by the Animal Selection section above */}

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">{t("home.featured_products")}</h2>
              <p className="text-muted-foreground mt-1">{t("home.bestsellers_and_new")}</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">
                {t("home.see_more")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">{t("home.popular_brands")}</h2>
              <p className="text-muted-foreground mt-1">{t("home.trusted_brands")}</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/brands">
                {t("home.all_brands")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {brands.slice(0, 6).map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden bg-primary">
            <div className="absolute inset-0 opacity-10">
              <Image src="/abstract-categories.png" alt="" fill className="object-cover" />
            </div>
            <div className="relative px-6 py-12 md:px-12 md:py-16 text-center">
              <span className="inline-block px-4 py-1.5 bg-background/20 text-primary-foreground text-sm font-medium rounded-full mb-4">
                {t("home.special_offer")}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                {t("home.join_community")}
              </h2>
              <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8">
                {t("home.newsletter_desc")}
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  {t("home.get_started")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
