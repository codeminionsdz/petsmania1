"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, User, Menu, Heart, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { useCart } from "@/lib/cart-context"
import type { Category } from "@/lib/types"
import { getCategoryIcon } from "@/lib/category-icons"
import { useTranslation } from "@/hooks/use-translation"
import { LanguageSwitcher } from "@/components/layout/language-switcher"

interface HeaderProps {
  categories?: Category[]
}

interface Settings {
  free_shipping_threshold: number
  enable_free_shipping: boolean
}

export function Header({ categories: initialCategories }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const { itemCount, toggleCart } = useCart()
  const { t } = useTranslation()
  
  // استخدام البيانات المُمررة مباشرة - مع التأكد من أنها محملة
  const categories = initialCategories || []
  const hasCategories = categories.length > 0

  // Load settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top bar - Only show if Free Shipping is Enabled */}
      {settings?.enable_free_shipping && (
        <div className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between text-sm">
              <p>
                {t("header.free_shipping")} {settings?.free_shipping_threshold} DZD
              </p>
              <div className="hidden md:flex items-center gap-4">
                <Link href="/account/orders" className="hover:underline">
                  {t("header.track")}
                </Link>
                <span>|</span>
                <Link href="/contact" className="hover:underline">
                  {t("header.support")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg p-0.5 shadow-sm">
              <Image
                src="/images/image.png"
                alt="Parapharmacie l'Olivier"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl md:text-2xl font-bold text-primary hidden sm:block">Parapharmacie l'Olivier</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <form action="/search" method="get" className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                placeholder={t("search.placeholder")}
                className="w-full pl-10 pr-4 h-11 bg-secondary border-0 focus-visible:ring-primary"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">{t("action.search")}</span>
            </Button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
              <Link href="/account/wishlist">
                <Heart className="h-5 w-5" />
                <span className="sr-only">{t("header.favorite")}</span>
              </Link>
            </Button>

            {/* Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">{t("header.account")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/login">{t("header.login")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/register">{t("header.register")}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">{t("header.my_account")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/orders">{t("header.my_orders")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/wishlist">{t("header.wishlist")}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">
                {t("header.cart")} ({itemCount} articles)
              </span>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t("header.menu")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 overflow-y-auto">
                <SheetTitle className="text-xl font-bold">{t("header.menu")}</SheetTitle>
                <nav className="flex flex-col gap-2 mt-8">
                  <Link
                    href="/categories"
                    className="text-lg font-semibold hover:text-primary py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("header.all_categories")}
                  </Link>

                  {categories.map((category) => (
                    <div key={category.id} className="border-b border-border pb-3">
                      <button
                        className="flex items-center justify-between w-full py-3 text-left font-semibold hover:text-primary transition-colors duration-200"
                        onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                      >
                        <Link
                          href={`/categories/${category.slug}`}
                          className="text-foreground hover:text-primary transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsMobileMenuOpen(false)
                          }}
                        >
                          {category.name}
                        </Link>
                        {category.children && category.children.length > 0 && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${expandedCategory === category.id ? "rotate-180" : ""}`}
                          />
                        )}
                      </button>

                      {expandedCategory === category.id && category.children && (
                        <div className="pl-4 flex flex-col gap-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          {category.children.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/categories/${sub.slug}`}
                              className="text-muted-foreground hover:text-primary py-2 text-sm transition-colors duration-200"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <hr className="my-2" />
                  <Link
                    href="/brands"
                    className="text-lg font-medium hover:text-primary py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Marques
                  </Link>
                  <hr className="my-2" />
                  <Link
                    href="/login"
                    className="text-lg font-medium hover:text-primary py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/register"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Créer un compte
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden mt-4">
            <form action="/search" method="get" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                placeholder={t("search.placeholder")}
                className="w-full pl-10 pr-4 h-11 bg-secondary border-0"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      <nav className="hidden md:block border-t border-border">
        <div className="container mx-auto px-4">
          <NavigationMenu className="max-w-none">
            <NavigationMenuList className="gap-1">
              {/* Categories Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-medium">Catégories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[900px] p-6">
                    {!hasCategories ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <>
                      <div className="grid grid-cols-3 gap-4">
                        {categories.map((category) => {
                          const Icon = getCategoryIcon(category.slug)
                          return (
                            <div 
                              key={category.id} 
                              className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-background to-secondary/30 p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:scale-[1.02]"
                            >
                              <Link
                                href={`/categories/${category.slug}`}
                                className="flex items-start gap-3 mb-4"
                              >
                                <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors duration-200">
                                    {category.name}
                                  </h3>
                                  {category.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {category.description}
                                    </p>
                                  )}
                                </div>
                              </Link>
                              
                              {category.children && category.children.length > 0 && (
                                <ul className="space-y-1.5 border-t border-border/50 pt-3">
                                  {category.children.slice(0, 4).map((sub) => (
                                    <li key={sub.id}>
                                      <Link
                                        href={`/categories/${sub.slug}`}
                                        className="text-sm block py-1.5 px-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                                      >
                                        {sub.name}
                                      </Link>
                                    </li>
                                  ))}
                                  {category.children.length > 4 && (
                                    <li>
                                      <Link
                                        href={`/categories/${category.slug}`}
                                        className="text-sm block py-1.5 px-2 rounded-md font-medium text-primary hover:bg-primary/5 transition-all duration-200 flex items-center gap-1"
                                      >
                                        <span>+{category.children.length - 4} autres</span>
                                        <span className="text-xs">→</span>
                                      </Link>
                                    </li>
                                  )}
                                </ul>
                              )}
                              
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </div>
                          )
                        })}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-border">
                        <Link 
                          href="/categories" 
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200"
                        >
                          <span>Voir toutes les catégories</span>
                          <span className="text-lg">→</span>
                        </Link>
                      </div>
                      </>
                    )}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/brands" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                    Marques
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>
    </header>
  )
}
