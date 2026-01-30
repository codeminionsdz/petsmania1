/**
 * OrganicLayout Component
 * Root wrapper that applies organic design system to entire page/section
 */

"use client"

import React, { ReactNode, useMemo, useEffect } from "react"
import type { AnimalType } from "@/lib/types"
import {
  getPaletteFromPersonality,
  getOrganicTransition,
  initializeOrganicSystem,
} from "@/lib/organic"
import OrganicBackground from "./OrganicBackground"

interface OrganicLayoutProps {
  children: ReactNode
  animalType: AnimalType
  showBackground?: boolean
  className?: string
  fullScreen?: boolean
}

export function OrganicLayout({
  children,
  animalType,
  showBackground = true,
  className = "",
  fullScreen = true,
}: OrganicLayoutProps) {
  const palette = useMemo(
    () => getPaletteFromPersonality(animalType),
    [animalType]
  )

  const transitions = useMemo(
    () => getOrganicTransition(animalType),
    [animalType]
  )

  const cssVariables = useMemo(
    () => initializeOrganicSystem(animalType),
    [animalType]
  )

  // Apply CSS variables to document
  useEffect(() => {
    const root = document.documentElement
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    return () => {
      Object.keys(cssVariables).forEach((key) => {
        root.style.removeProperty(key)
      })
    }
  }, [cssVariables])

  return (
    <div
      className={`
        relative
        ${fullScreen ? "w-screen h-screen" : "w-full"}
        overflow-hidden
        ${className}
      `}
      style={{
        backgroundColor: palette.light,
      }}
    >
      {/* Organic background */}
      {showBackground && <OrganicBackground animalType={animalType} />}

      {/* Content wrapper */}
      <div
        className="relative z-10 w-full h-full overflow-auto"
        style={{
          transition: `background-color ${transitions.enter.duration}ms ${transitions.enter.easing}`,
        }}
      >
        {children}
      </div>

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, ${palette.dark}08 100%)`,
        }}
      />
    </div>
  )
}

export default OrganicLayout
