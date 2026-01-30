/**
 * OrganicVisualLayer Component
 * Creates organic, living visual effects (gradients, noise, waves)
 * Adapts colors based on animal context
 * Runs silently in background without distraction
 */

"use client"

import React, { useEffect, useRef, useId } from "react"
import type { AnimalType } from "@/lib/types"
import { getColorPalette } from "@/lib/organic"

interface OrganicVisualLayerProps {
  animalType: AnimalType
  effectType?: "waves" | "noise" | "gradient-flow" | "mask-blend" | "shimmer"
  intensity?: number // 0-1
  opacity?: number // 0-1
  className?: string
  animated?: boolean
  blur?: number
  speed?: "slow" | "normal" | "fast"
}

/**
 * Generate SVG noise pattern
 */
function generateNoiseSVG(id: string, color: string): string {
  return `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="${id}-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0.3" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="${color}" filter="url(#${id}-noise)" opacity="0.08" />
    </svg>
  `
}

/**
 * Generate SVG wave pattern
 */
function generateWaveSVG(id: string, color: string, speed: string): string {
  const duration = speed === "slow" ? "8s" : speed === "fast" ? "3s" : "5s"

  return `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120">
      <defs>
        <linearGradient id="${id}-wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.2" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
        </linearGradient>
        <style>
          @keyframes wave-${id} {
            0% { transform: translateX(0); }
            100% { transform: translateX(1200px); }
          }
          .wave-path-${id} {
            animation: wave-${id} ${duration} linear infinite;
            fill: url(#${id}-wave-gradient);
          }
        </style>
      </defs>
      
      <!-- Wave 1 -->
      <path class="wave-path-${id}" d="M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z" />
      
      <!-- Wave 2 (offset) -->
      <path class="wave-path-${id}" d="M-600,60 Q-300,30 0,60 T600,60 L600,120 L-600,120 Z" opacity="0.5" />
    </svg>
  `
}

/**
 * Generate SVG gradient flow
 */
function generateGradientFlowSVG(id: string, color1: string, color2: string): string {
  return `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}-flow-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:0.1" />
          <stop offset="50%" style="stop-color:${color2};stop-opacity:0.05" />
          <stop offset="100%" style="stop-color:${color1};stop-opacity:0.1" />
        </linearGradient>
        <linearGradient id="${id}-flow-2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${color2};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${color1};stop-opacity:0.05" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#${id}-flow-1)" />
      <rect width="100%" height="100%" fill="url(#${id}-flow-2)" />
    </svg>
  `
}

/**
 * Generate SVG mask blend effect
 */
function generateMaskBlendSVG(id: string, color: string): string {
  return `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${id}-mask-radial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.15" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
        </radialGradient>
        <filter id="${id}-mask-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
        </filter>
      </defs>
      
      <!-- Multiple radial gradients for organic effect -->
      <circle cx="25%" cy="25%" r="40%" fill="url(#${id}-mask-radial)" filter="url(#${id}-mask-blur)" />
      <circle cx="75%" cy="75%" r="35%" fill="url(#${id}-mask-radial)" filter="url(#${id}-mask-blur)" />
      <circle cx="50%" cy="50%" r="30%" fill="url(#${id}-mask-radial)" filter="url(#${id}-mask-blur)" opacity="0.7" />
    </svg>
  `
}

/**
 * Generate shimmer effect SVG
 */
function generateShimmerSVG(id: string, color: string): string {
  return `
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0" />
          <stop offset="50%" style="stop-color:${color};stop-opacity:0.08" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
        </linearGradient>
        <style>
          @keyframes shimmer-${id} {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .shimmer-${id} {
            animation: shimmer-${id} 4s infinite;
          }
        </style>
      </defs>
      <rect class="shimmer-${id}" width="200%" height="100%" fill="url(#${id}-shimmer)" />
    </svg>
  `
}

/**
 * OrganicVisualLayer Component
 */
export function OrganicVisualLayer({
  animalType,
  effectType = "waves",
  intensity = 0.6,
  opacity = 0.5,
  className = "",
  animated = true,
  blur = 0,
  speed = "normal",
}: OrganicVisualLayerProps) {
  const containerId = useId()
  const svgRef = useRef<HTMLDivElement>(null)
  const palette = getColorPalette(animalType)

  // Generate SVG based on effect type
  const generateSVG = (): string => {
    switch (effectType) {
      case "waves":
        return generateWaveSVG(containerId, palette.accent, speed)

      case "noise":
        return generateNoiseSVG(containerId, palette.base)

      case "gradient-flow":
        return generateGradientFlowSVG(containerId, palette.accent, palette.light)

      case "mask-blend":
        return generateMaskBlendSVG(containerId, palette.accent)

      case "shimmer":
        return generateShimmerSVG(containerId, palette.accent)

      default:
        return generateWaveSVG(containerId, palette.accent, speed)
    }
  }

  const svgContent = generateSVG()

  // Adjust intensity
  const effectOpacity = intensity * opacity

  return (
    <div
      ref={svgRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{
        opacity: effectOpacity,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    >
      {/* SVG Visual Layer */}
      <div
        className="absolute inset-0 w-full h-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{
          animation: animated ? undefined : "none",
        }}
      />

      {/* Optional: Additional blur/glow layer for enhanced effect */}
      <div
        className="absolute inset-0 mix-blend-mode-screen"
        style={{
          background: `radial-gradient(ellipse at center, ${palette.light}20, transparent)`,
          opacity: 0.3,
        }}
      />
    </div>
  )
}

export default OrganicVisualLayer
