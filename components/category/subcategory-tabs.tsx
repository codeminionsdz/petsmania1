"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Category } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SubcategoryTabsProps {
  /**
   * The parent category (main category with subcategories)
   */
  parentCategory: Category

  /**
   * Currently selected subcategory
   */
  currentSubcategory: Category

  /**
   * Optional: show as horizontal tabs (default) or vertical sidebar
   */
  layout?: "tabs" | "sidebar"

  /**
   * Optional: custom className
   */
  className?: string
}

export function SubcategoryTabs({
  parentCategory,
  currentSubcategory,
  layout = "tabs",
  className,
}: SubcategoryTabsProps) {
  const subcategories = parentCategory.children || []
  const [scrollPosition, setScrollPosition] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Check scroll position for left/right buttons
  const checkScroll = useCallback((container: HTMLElement | null) => {
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setScrollPosition(scrollLeft)
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }, [])

  useEffect(() => {
    const container = document.getElementById("subcategory-scroll-container")
    checkScroll(container)

    const handleScroll = () => checkScroll(container)
    container?.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", () => checkScroll(container))

    return () => {
      container?.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", () => checkScroll(container))
    }
  }, [checkScroll])

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("subcategory-scroll-container")
    if (!container) return

    const scrollAmount = 300
    const newPosition = direction === "left" 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount

    container.scrollTo({ left: newPosition, behavior: "smooth" })
  }

  if (layout === "sidebar") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {subcategories.map((subcategory) => {
          const isActive = subcategory.id === currentSubcategory.id
          return (
            <Link
              key={subcategory.id}
              href={`/categories/${subcategory.slug}`}
              className={cn(
                "relative px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                "border-l-4 border-transparent",
                isActive
                  ? "bg-primary/10 text-primary border-l-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {subcategory.name}
              {isActive && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                </span>
              )}
            </Link>
          )
        })}
      </div>
    )
  }

  // Horizontal tabs layout (default)
  return (
    <div className={cn("space-y-4", className)}>
      {/* Subcategory selector */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Sous-catégories
        </p>

        <div className="relative group">
          {/* Left scroll button */}
          {canScrollLeft && (
            <Button
              onClick={() => scroll("left")}
              size="icon"
              variant="ghost"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full w-10 rounded-r-none bg-gradient-to-r from-background via-background to-transparent hover:from-background/80"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Scrollable tabs container */}
          <div
            id="subcategory-scroll-container"
            className="flex gap-2 overflow-x-auto scrollbar-hide px-0 py-2"
            style={{ scrollBehavior: "smooth" }}
          >
            {subcategories.map((subcategory) => {
              const isActive = subcategory.id === currentSubcategory.id
              return (
                <Link
                  key={subcategory.id}
                  href={`/categories/${subcategory.slug}`}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0",
                    "border-b-2 border-transparent",
                    isActive
                      ? "text-primary border-b-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {subcategory.name}
                </Link>
              )
            })}
          </div>

          {/* Right scroll button */}
          {canScrollRight && (
            <Button
              onClick={() => scroll("right")}
              size="icon"
              variant="ghost"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full w-10 rounded-l-none bg-gradient-to-l from-background via-background to-transparent hover:from-background/80"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick stats or info - only show other subcategories count */}
      <div className="text-xs text-muted-foreground">
        {subcategories.length} sous-catégories disponibles • Sélectionné: <span className="font-semibold text-foreground">{currentSubcategory.name}</span>
      </div>
    </div>
  )
}
