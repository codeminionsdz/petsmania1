"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShieldCheck, Truck, Clock, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/product-card"
import { MainCategoryCard } from "@/components/category/main-category-card"
import { BrandCard } from "@/components/brand/brand-card"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { HeroCarousel } from "@/components/layout/hero-carousel"
import { useTranslation } from "@/hooks/use-translation"
import type { Category, Product, Brand } from "@/lib/types"

interface HomeContentProps {
  categories: Category[]
  brands: Brand[]
  featuredProducts: Product[]
}

export function HomeContent({ categories, brands, featuredProducts }: HomeContentProps) {
  const { t } = useTranslation()

  return (
    <>
      <CartDrawer />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Trust Badges */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{t("home.authentic_products")}</p>
                <p className="text-sm text-muted-foreground">{t("home.authentic_guarantee")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{t("home.fast_delivery")}</p>
                <p className="text-sm text-muted-foreground">{t("home.delivery_time")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{t("home.expert_support")}</p>
                <p className="text-sm text-muted-foreground">{t("home.support_hours")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{t("home.best_prices")}</p>
                <p className="text-sm text-muted-foreground">{t("home.guaranteed")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">{t("home.categories")}</h2>
              <p className="text-muted-foreground mt-1">{t("home.find_what_you_need")}</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/categories">
                {t("home.view_all")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.slice(0, 8).map((category) => (
              <MainCategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

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
