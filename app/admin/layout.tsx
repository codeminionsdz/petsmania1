"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setIsLoading(false)
      return
    }

    // Check if admin is authenticated
    const adminAuth = localStorage.getItem("admin_authenticated")
    const authTime = localStorage.getItem("admin_auth_time")

    // Session expires after 24 hours
    const isValid = adminAuth === "true" && authTime && Date.now() - Number.parseInt(authTime) < 24 * 60 * 60 * 1000

    if (isValid) {
      setIsAuthenticated(true)
    } else {
      // Clear expired session
      localStorage.removeItem("admin_authenticated")
      localStorage.removeItem("admin_auth_time")
      router.push("/admin/login")
    }

    setIsLoading(false)
  }, [pathname, router])

  // Show login page without layout
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show nothing while redirecting to login
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-secondary">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
