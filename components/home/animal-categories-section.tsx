"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Cat, Dog, Bird, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimalCategoryCard } from "@/components/home/animal-category-card"
import { ANIMAL_COLORS } from "@/lib/animal-colors"

const ANIMAL_CATEGORIES = [
  {
    type: "cat",
    label: ANIMAL_COLORS.cat.name,
    icon: Cat,
    pastelColor: "rgba(255, 182, 193, 0.3)", // Light pink pastel
    borderColor: "border-pink-200",
    textColor: "text-pink-700",
    accentColor: "rgba(255, 182, 193, 0.5)",
    overlayColor: ANIMAL_COLORS.cat.transitionOverlay,
    href: "/cats",
  },
  {
    type: "dog",
    label: ANIMAL_COLORS.dog.name,
    icon: Dog,
    pastelColor: "rgba(255, 218, 185, 0.3)", // Peach pastel
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    accentColor: "rgba(255, 218, 185, 0.5)",
    overlayColor: ANIMAL_COLORS.dog.transitionOverlay,
    href: "/dogs",
  },
  {
    type: "bird",
    label: ANIMAL_COLORS.bird.name,
    icon: Bird,
    pastelColor: "rgba(173, 216, 230, 0.3)", // Light blue pastel
    borderColor: "border-sky-200",
    textColor: "text-sky-700",
    accentColor: "rgba(173, 216, 230, 0.5)",
    overlayColor: ANIMAL_COLORS.bird.transitionOverlay,
    href: "/birds",
  },
  {
    type: "other",
    label: ANIMAL_COLORS.other.name,
    icon: PawPrint,
    pastelColor: "rgba(221, 160, 221, 0.3)", // Plum pastel
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    accentColor: "rgba(221, 160, 221, 0.5)",
    overlayColor: ANIMAL_COLORS.other.transitionOverlay,
    href: "/others",
  },
]

export function AnimalCategoriesSection() {
  const router = useRouter()
  const [activeAnimal, setActiveAnimal] = useState<string | null>(null)
  const [overlayColor, setOverlayColor] = useState<string>("")

  useEffect(() => {
    if (!activeAnimal) return

    const timer = setTimeout(() => {
      const animal = ANIMAL_CATEGORIES.find((a) => a.type === activeAnimal)
      if (animal) {
        router.push(animal.href)
      }
    }, 400) // Match animation duration

    return () => clearTimeout(timer)
  }, [activeAnimal, router])

  const handleCardClick = (e: React.MouseEvent, category: (typeof ANIMAL_CATEGORIES)[0]) => {
    e.preventDefault()
    setActiveAnimal(category.type)
    setOverlayColor(category.overlayColor)
  }

  return (
    <section className="py-12 md:py-16">
      <style>{`
        /* Page transition animations */
        @keyframes transition-fade-out {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.95);
          }
        }
        
        @keyframes transition-overlay-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        .page-transition-active {
          animation: transition-fade-out 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .transition-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 50;
          pointer-events: none;
          animation: transition-overlay-in 0.2s ease-out forwards;
        }
        
        /* Loading indicator animations */
        .loading-indicator {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        
        @keyframes icon-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
          }
        }
        
        @keyframes paw-bounce {
          0%, 100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          50% {
            transform: scale(1.05) translateY(-8px);
          }
        }
        
        @keyframes paw-rotate {
          0% {
            transform: rotateZ(0deg);
          }
          100% {
            transform: rotateZ(360deg);
          }
        }
        
        .icon-loading {
          font-size: 5rem;
          animation: icon-pulse 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
          margin-bottom: 1rem;
          will-change: transform;
        }
        
        .paw-loading {
          font-size: 3rem;
          animation: paw-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
          margin-bottom: 1rem;
          will-change: transform;
        }
        
        .loading-spinner-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: rgba(255, 255, 255, 0.8);
          animation: paw-rotate 1s linear infinite;
          will-change: transform;
        }
      `}</style>

      {/* Transition overlay with animated loading indicator */}
      {activeAnimal && (
        <div
          className="transition-overlay"
          style={{ backgroundColor: overlayColor }}
        >
          <div className="loading-indicator">
            {/* Animated animal icon */}
            <div className="icon-loading">
              {ANIMAL_CATEGORIES.find(c => c.type === activeAnimal)?.icon && 
                (() => {
                  const Icon = ANIMAL_CATEGORIES.find(c => c.type === activeAnimal)?.icon
                  return Icon ? <Icon className="w-20 h-20" strokeWidth={1.5} /> : null
                })()
              }
            </div>
            
            {/* Paw stamp loading animation */}
            <div className="paw-loading">🐾</div>
            
            {/* Subtle spinner */}
            <div className="loading-spinner-circle" />
          </div>
        </div>
      )}

      {/* Page content with transition animation */}
      <div className={`container mx-auto px-4 ${activeAnimal ? "page-transition-active" : ""}`}>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Trouvez par animal</h2>
            <p className="text-muted-foreground mt-1">Sélectionnez votre animal préféré pour découvrir des produits adaptés</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {ANIMAL_CATEGORIES.map((category) => (
            <AnimalCategoryCard
              key={category.type}
              type={category.type}
              label={category.label}
              icon={category.icon}
              pastelColor={category.pastelColor}
              borderColor={category.borderColor}
              textColor={category.textColor}
              accentColor={category.accentColor}
              onClick={(e) => handleCardClick(e, category)}
              disabled={activeAnimal !== null}
            />
          ))}
        </div>

        {/* Subtext */}
        <div className="mt-12 p-6 rounded-xl bg-secondary/50 text-center transition-all duration-300 hover:bg-secondary/70">
          <p className="text-muted-foreground">
            Choisissez d'abord votre animal, puis explorez ses catégories dédiées
          </p>
        </div>
      </div>
    </section>
  )
}
