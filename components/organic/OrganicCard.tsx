/**
 * OrganicCard Component
 * Interactive card with animal-context-aware hover effects and transitions
 */

"use client"

import React, { ReactNode, useState, useRef } from "react"
import type { AnimalType } from "@/lib/types"
import {
  getHoverConfig,
  getPaletteFromPersonality,
  getOrganicTransition,
} from "@/lib/organic"

interface OrganicCardProps {
  children: ReactNode
  animalType: AnimalType
  className?: string
  onClick?: () => void
  interactive?: boolean
  glowEffect?: boolean
}

export function OrganicCard({
  children,
  animalType,
  className = "",
  onClick,
  interactive = true,
  glowEffect = true,
}: OrganicCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const hoverConfig = getHoverConfig(animalType)
  const palette = getPaletteFromPersonality(animalType)
  const transitions = getOrganicTransition(animalType)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true)
  }

  const handleMouseLeave = () => {
    if (interactive) setIsHovered(false)
  }

  return (
    <div
      ref={cardRef}
      className={`
        relative rounded-2xl overflow-hidden
        ${interactive ? "cursor-pointer" : ""}
        ${className}
      `}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: isHovered
          ? `scale(${hoverConfig.scale}) perspective(1000px)`
          : "scale(1)",
        transition: `transform ${hoverConfig.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      }}
    >
      {/* Main content */}
      <div className="relative z-10">{children}</div>

      {/* Glow effect on hover */}
      {glowEffect && interactive && isHovered && (
        <div
          className="absolute pointer-events-none"
          style={{
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${palette.accent}40, transparent)`,
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transform: "translate(-50%, -50%)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Border glow */}
      {interactive && isHovered && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            border: `2px solid ${palette.accent}`,
            opacity: hoverConfig.glowIntensity,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      )}
    </div>
  )
}

export default OrganicCard
