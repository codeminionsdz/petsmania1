/**
 * OrganicTransition Component
 * Wrapper for emotion-driven page transitions based on animal context
 */

"use client"

import React, { ReactNode, useEffect, useState } from "react"
import type { AnimalType } from "@/lib/types"
import { getOrganicTransition, getAnimationClassName } from "@/lib/organic"

interface OrganicTransitionProps {
  children: ReactNode
  animalType: AnimalType
  effectType?: "float" | "pulse" | "drift" | "breathe"
  trigger?: boolean
  className?: string
}

export function OrganicTransition({
  children,
  animalType,
  effectType = "float",
  trigger = true,
  className = "",
}: OrganicTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const config = getOrganicTransition(animalType)
  const animationClass = getAnimationClassName(animalType, effectType)

  useEffect(() => {
    if (trigger) {
      // Small delay for smooth entry
      const timer = setTimeout(() => setIsVisible(true), 0)
      return () => clearTimeout(timer)
    }
  }, [trigger])

  return (
    <div
      className={`
        ${className}
        ${isVisible ? "opacity-100" : "opacity-0"}
        transition-opacity duration-${config.enter.duration}
        ${animationClass}
      `}
      style={{
        transitionDuration: `${config.enter.duration}ms`,
        transitionTimingFunction: config.enter.easing,
      }}
    >
      {children}
    </div>
  )
}

export default OrganicTransition
