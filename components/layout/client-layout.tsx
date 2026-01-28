"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useState, useEffect } from "react"
import type { Category } from "@/lib/types"
import { LanguageProvider } from "@/lib/language-context"
import { useLanguage } from "@/lib/language-context"

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // تحميل الفئات مرة واحدة عند بدء التطبيق
    if (!isAdminRoute) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          setCategories(data)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Failed to load categories:", err)
          setIsLoading(false)
        })
    }
  }, [isAdminRoute])

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  if (isAdminRoute) {
    // صفحات الإدارة - بدون header وfooter
    return <>{children}</>
  }

  // صفحات العملاء - مع header وfooter
  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [htmlDir, setHtmlDir] = useState<"ltr" | "rtl">("ltr")

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hook to update dir attribute when language changes
  useEffect(() => {
    if (!mounted) return

    const updateDir = () => {
      const savedLanguage = localStorage.getItem("language") || "fr"
      const dir = savedLanguage === "ar" ? "rtl" : "ltr"
      setHtmlDir(dir)
      // Update html element
      const htmlElement = document.documentElement
      htmlElement.setAttribute("dir", dir)
      htmlElement.setAttribute("lang", savedLanguage)
    }

    // Set initial direction
    updateDir()

    // Listen for storage changes (when language changes in another tab)
    window.addEventListener("storage", updateDir)

    return () => {
      window.removeEventListener("storage", updateDir)
    }
  }, [mounted])

  if (!mounted) {
    return (
      <LanguageProvider>
        <ClientLayoutContent>{children}</ClientLayoutContent>
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </LanguageProvider>
  )
}
