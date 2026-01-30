/**
 * OrganicBackground Component
 * Renders context-aware organic backgrounds with personality
 */

"use client"

import React, { useMemo, useCallback } from "react"
import type { AnimalType } from "@/lib/types"
import { getCachedBackground, getPaletteFromPersonality } from "@/lib/organic"

interface OrganicBackgroundProps {
  animalType: AnimalType
  className?: string
  opacity?: number
  animated?: boolean
  blur?: number
}

export function OrganicBackground({
  animalType,
  className = "",
  opacity = 1,
  animated = true,
  blur = 0,
}: OrganicBackgroundProps) {
  // Get background configuration
  const background = useMemo(
    () => getCachedBackground(animalType),
    [animalType]
  )

  const palette = useMemo(
    () => getPaletteFromPersonality(animalType),
    [animalType]
  )

  // Convert SVG to data URI
  const bgSrc = useMemo(() => {
    const encoded = encodeURIComponent(background.svg)
    return `data:image/svg+xml,${encoded}`
  }, [background.svg])

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url('${bgSrc}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.6,
        }}
      />

      {/* Color gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${palette.light} 0%, ${palette.light}80 100%)`,
          opacity: 0.3,
        }}
      />

      {/* Animated shimmer effect */}
      {animated && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${palette.accent}20, transparent)`,
            animationDuration: "3s",
          }}
        />
      )}
    </div>
  )
}

export default OrganicBackground
