/**
 * Advanced Visual Layer Component
 * Creates complex, multi-layered organic visual effects
 * Perfect for backgrounds, overlays, and decorative elements
 */

"use client"

import React, { useId } from "react"
import type { AnimalType } from "@/lib/types"
import { getColorPalette, getAnimalPersonality } from "@/lib/organic"

interface MultiLayerVisualProps {
  animalType: AnimalType
  layers?: Array<{
    type: "waves" | "noise" | "gradient-flow" | "mask-blend" | "shimmer"
    intensity?: number
    opacity?: number
    blur?: number
    speed?: "slow" | "normal" | "fast"
  }>
  className?: string
  interactive?: boolean // responds to mouse movement
  glowIntensity?: number
}

/**
 * Generate particle grid SVG for subtle texture
 */
function generateParticleGridSVG(id: string, color: string): string {
  return `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="${id}-particles" x="80" y="80" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="40" r="2" fill="${color}" opacity="0.3" />
          <circle cx="15" cy="15" r="1.5" fill="${color}" opacity="0.2" />
          <circle cx="65" cy="65" r="1" fill="${color}" opacity="0.15" />
          <circle cx="25" cy="65" r="1.2" fill="${color}" opacity="0.25" />
          <circle cx="65" cy="25" r="1.5" fill="${color}" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#${id}-particles)" />
    </svg>
  `
}

/**
 * Generate organic cell/blob pattern
 */
function generateBlobPatternSVG(id: string, color: string): string {
  return `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <defs>
        <filter id="${id}-blob-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
        <style>
          @keyframes blob-pulse-${id} {
            0%, 100% { r: 120px; opacity: 0.08; }
            50% { r: 140px; opacity: 0.12; }
          }
          .blob-${id} {
            animation: blob-pulse-${id} 6s ease-in-out infinite;
          }
        </style>
      </defs>
      
      <circle class="blob-${id}" cx="200" cy="150" fill="${color}" filter="url(#${id}-blob-blur)" />
      <circle class="blob-${id}" cx="900" cy="250" fill="${color}" filter="url(#${id}-blob-blur)" style="animation-delay: 1s;" />
      <circle class="blob-${id}" cx="500" cy="500" fill="${color}" filter="url(#${id}-blob-blur)" style="animation-delay: 2s;" />
      <circle class="blob-${id}" cx="1000" cy="650" fill="${color}" filter="url(#${id}-blob-blur)" style="animation-delay: 0.5s;" />
    </svg>
  `
}

/**
 * OrganicMultiLayerVisual Component
 */
export function OrganicMultiLayerVisual({
  animalType,
  layers = [
    { type: "waves", intensity: 0.5, opacity: 0.4 },
    { type: "gradient-flow", intensity: 0.3, opacity: 0.3 },
  ],
  className = "",
  interactive = false,
  glowIntensity = 0.2,
}: MultiLayerVisualProps) {
  const containerId = useId()
  const palette = getColorPalette(animalType)
  const personality = getAnimalPersonality(animalType)

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* Base particle grid - always present for texture */}
      <div
        className="absolute inset-0 w-full h-full"
        dangerouslySetInnerHTML={{
          __html: generateParticleGridSVG(containerId, palette.base),
        }}
        style={{ opacity: 0.3 }}
      />

      {/* Blob pattern layer - pulsing background */}
      <div
        className="absolute inset-0 w-full h-full"
        dangerouslySetInnerHTML={{
          __html: generateBlobPatternSVG(containerId, palette.accent),
        }}
        style={{ opacity: 0.4 }}
      />

      {/* Dynamic layers based on personality */}
      {layers.map((layer, idx) => (
        <div
          key={`${idx}-${layer.type}`}
          className="absolute inset-0 w-full h-full"
          style={{
            opacity: (layer.opacity ?? 0.3) * (layer.intensity ?? 0.6),
            filter: layer.blur ? `blur(${layer.blur}px)` : undefined,
            mixBlendMode: idx % 2 === 0 ? "screen" : "multiply",
          }}
        >
          {/* Layer content would be rendered here */}
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(
                ${45 + idx * 15}deg,
                ${palette.light}15 0%,
                ${palette.accent}08 50%,
                ${palette.light}15 100%
              )`,
            }}
          />
        </div>
      ))}

      {/* Glow overlay based on personality energy */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: `radial-gradient(
            ellipse at center,
            ${palette.accent}${Math.round(glowIntensity * 40).toString(16).padStart(2, "0")},
            transparent 70%
          )`,
          opacity: personality.energyLevel === "vibrant" ? 0.4 : 0.2,
          pointerEvents: "none",
        }}
      />
    </div>
  )
}

export default OrganicMultiLayerVisual
