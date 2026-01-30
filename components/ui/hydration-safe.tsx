"use client"

import { useEffect, useState } from "react"

interface HydrationSafeProps {
  children: React.ReactNode
  suppressWarning?: boolean
}

/**
 * Wrapper component to prevent hydration mismatches with Radix UI
 * Renders children only after client hydration is complete
 * This prevents ID mismatches between server and client rendering
 */
export function HydrationSafe({ children, suppressWarning = true }: HydrationSafeProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    // Return placeholder with same dimensions to avoid layout shift
    return <div className="w-full" />
  }

  return <div suppressHydrationWarning={suppressWarning}>{children}</div>
}
