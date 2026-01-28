"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem("admin_authenticated")
    const authTime = localStorage.getItem("admin_auth_time")

    // Session expires after 24 hours
    const isValid = adminAuth === "true" && authTime && Date.now() - Number.parseInt(authTime) < 24 * 60 * 60 * 1000

    if (isValid) {
      router.push("/admin/dashboard")
    } else {
      router.push("/admin/login")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}
