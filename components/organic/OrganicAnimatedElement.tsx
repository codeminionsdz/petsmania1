/**
 * OrganicAnimatedElement Component
 * Applies natural, varied motion to any element
 * Each instance has unique timing/delay for organic feel
 */

"use client"

import React, { useId } from "react"
import type { AnimalType } from "@/lib/types"
import { useMotionVariation } from "@/hooks/useMotionVariation"
import { createCSSEasing } from "@/lib/organic/easing-functions"

interface OrganicAnimatedElementProps {
  children: React.ReactNode
  animalType: AnimalType
  animationType: "float" | "pulse" | "drift" | "breathe"
  className?: string
  style?: React.CSSProperties
  as?: keyof JSX.IntrinsicElements
}

/**
 * Generate animation keyframes with varied intensity
 */
function generateAnimationKeyframes(
  animationType: string,
  intensity: number
): string {
  const baseIntensity = intensity

  switch (animationType) {
    case "float":
      return `
        @keyframes organic-float-varied {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 1; }
          25% { transform: translateY(-${8 * baseIntensity}px) translateX(${4 * baseIntensity}px); }
          50% { transform: translateY(-${12 * baseIntensity}px) translateX(-${4 * baseIntensity}px); opacity: 0.95; }
          75% { transform: translateY(-${6 * baseIntensity}px) translateX(${4 * baseIntensity}px); }
        }
      `

    case "pulse":
      return `
        @keyframes organic-pulse-varied {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(${1 + 0.08 * baseIntensity}); opacity: ${0.95 - 0.05 * baseIntensity}; }
        }
      `

    case "drift":
      return `
        @keyframes organic-drift-varied {
          0%, 100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
          25% { transform: translateX(${6 * baseIntensity}px) translateY(-${3 * baseIntensity}px) rotate(${2 * baseIntensity}deg); }
          50% { transform: translateX(-${6 * baseIntensity}px) translateY(${3 * baseIntensity}px) rotate(-${2 * baseIntensity}deg); opacity: 0.98; }
          75% { transform: translateX(${4 * baseIntensity}px) translateY(-${2 * baseIntensity}px) rotate(${1 * baseIntensity}deg); }
        }
      `

    case "breathe":
      return `
        @keyframes organic-breathe-varied {
          0%, 100% { transform: scale(1); opacity: 1; }
          25% { transform: scale(${1 + 0.05 * baseIntensity}); }
          50% { transform: scale(${1 - 0.03 * baseIntensity}); opacity: 0.97; }
          75% { transform: scale(${1 + 0.04 * baseIntensity}); }
        }
      `

    default:
      return ""
  }
}

/**
 * OrganicAnimatedElement Component
 */
export function OrganicAnimatedElement({
  children,
  animalType,
  animationType,
  className = "",
  style = {},
  as: Component = "div",
}: OrganicAnimatedElementProps) {
  const elementId = useId()
  const variation = useMotionVariation(animalType, animationType, elementId)

  // Generate unique keyframes ID
  const keyframeId = `animation-${elementId}-${animationType}`
  const easing = createCSSEasing(variation.easing)

  // Generate animation CSS
  const animationCSS = `
    @keyframes ${keyframeId} {
      ${generateAnimationKeyframes(animationType, variation.intensity)}
    }

    .organic-animated-${elementId} {
      animation: ${keyframeId} ${variation.duration}ms ${easing} ${variation.delay}ms infinite;
      animation-fill-mode: both;
    }
  `

  return (
    <>
      {/* Inject animation styles */}
      <style>{animationCSS}</style>

      {/* Animated element */}
      <Component
        className={`organic-animated-${elementId} ${className}`}
        style={{
          ...style,
          willChange: "transform, opacity",
        }}
      >
        {children}
      </Component>
    </>
  )
}

export default OrganicAnimatedElement
