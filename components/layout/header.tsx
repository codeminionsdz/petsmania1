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
import { CategoriesMenu } from "@/components/layout/categories-menu"
import type { Category } from "@/lib/types"
import { getCategoryIcon } from "@/lib/category-icons"
import { useTranslation } from "@/hooks/use-translation"
import { usePathname } from "next/navigation"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { getAnimalRoute } from "@/lib/animal-utils"

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
  const pathname = usePathname()

  // Stable ref to track previous pathname across component remounts
  let headerPrevPathnameRef = (globalThis as any).__headerPrevPathnameRef as { current?: string } | undefined
  if (!headerPrevPathnameRef) {
    ;(globalThis as any).__headerPrevPathnameRef = { current: undefined }
    headerPrevPathnameRef = (globalThis as any).__headerPrevPathnameRef
  }
  
  // استخدام البيانات المُمررة مباشرة - مع التأكد من أنها محملة
  const categories = initialCategories || []
  const hasCategories = categories.length > 0

  const ANIMALS = [
    { value: "cat", label: "🐱 Chats" },
    { value: "dog", label: "🐕 Chiens" },
    { value: "bird", label: "🐦 Oiseaux" },
    { value: "other", label: "🐾 Autres" },
  ] as const
  // Load settings on mount (guarded to avoid updates after unmount)
  useEffect(() => {
    let mounted = true

    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings")
        const data = await response.json()
        if (mounted && data?.success) {
          setSettings(data.data)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      }
    }

    fetchSettings()

    return () => {
      mounted = false
    }
  }, [])

  // Close mobile sheet after navigation — do it asynchronously to avoid nested updates
  useEffect(() => {
    if (!isMobileMenuOpen) return
    // Only close when pathname actually changed (skip initial mount)
    let prev = (headerPrevPathnameRef.current)
    if (prev === undefined) {
      headerPrevPathnameRef.current = pathname
      return
    }

    if (prev !== pathname) {
      const id = window.setTimeout(() => setIsMobileMenuOpen(false), 0)
      headerPrevPathnameRef.current = pathname
      return () => clearTimeout(id)
    }
  }, [pathname, isMobileMenuOpen])

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
                src="/logo.png"
                alt="Petsmania"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl md:text-2xl font-bold text-primary hidden sm:block">Petsmania</span>
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
            <Button variant="ghost" size="icon" className="md:hidden transition-all duration-300 hover:scale-110 hover:bg-primary/10" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5 transition-transform duration-300" />
              <span className="sr-only">{t("action.search")}</span>
            </Button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild className="hidden sm:flex transition-all duration-300 hover:scale-110 hover:bg-primary/10">
              <Link href="/account/wishlist">
                <Heart className="h-5 w-5 transition-transform duration-300" />
                <span className="sr-only">{t("header.favorite")}</span>
              </Link>
            </Button>

            {/* Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="transition-all duration-300 hover:scale-110 hover:bg-primary/10">
                  <User className="h-5 w-5 transition-transform duration-300" />
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
            <Button variant="ghost" size="icon" className="relative transition-all duration-300 hover:scale-110 hover:bg-primary/10 group/cart" onClick={toggleCart}>
              <ShoppingCart className="h-5 w-5 transition-transform duration-300 group-hover/cart:scale-110" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground transition-all duration-300 group-hover/cart:scale-125">
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
                      className="text-lg font-semibold hover:text-primary py-2 transition-all duration-300 hover:translate-x-1"
                    >
                    {t("header.all_categories")}
                  </Link>

                  

                  {/* Simplified: show animals only in mobile menu */}
                  <div className="mt-4">
                    <h3 className="py-2 font-semibold text-lg">Par animal</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {ANIMALS.map((animal) => (
                        <Link
                          key={animal.value}
                          href={getAnimalRoute(animal.value as any)}
                          className="px-3 py-2 rounded-md text-sm font-medium bg-secondary border border-border hover:bg-secondary/80 text-center"
                        >
                          {animal.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <hr className="my-2" />
                  <Link href="/brands" className="text-lg font-medium hover:text-primary py-2">
                    Marques
                  </Link>
                  <hr className="my-2" />
                  <Link href="/login" className="text-lg font-medium hover:text-primary py-2">
                    Se connecter
                  </Link>
                  <Link href="/register" className="text-muted-foreground hover:text-primary">
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
              {/* Categories Menu - New Modern Mega Menu */}
              <CategoriesMenu categories={categories} />

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
