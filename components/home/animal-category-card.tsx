'use client'

import { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

interface AnimalCategoryCardProps {
  type: string
  label: string
  icon: LucideIcon
  pastelColor: string
  borderColor: string
  textColor: string
  accentColor: string
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
}

export function AnimalCategoryCard({
  type,
  label,
  icon: Icon,
  pastelColor,
  borderColor,
  textColor,
  accentColor,
  onClick,
  disabled = false,
}: AnimalCategoryCardProps) {
  return (
    <>
      <style>
        {`
          .animal-card-${type} {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .animal-card-${type}:disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        /* Ripple effect on click */
        .animal-card-${type}::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .animal-card-${type}:active::before {
          animation: ripple-effect-${type} 0.6s ease-out;
        }

        @keyframes ripple-effect-${type} {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }

        /* Organic blob animation - Responsive scale */
        .blob-${type} {
          position: absolute;
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          opacity: 0.6;
          filter: blur(1px);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @media (min-width: 1024px) {
          .animal-card-${type}:hover .blob-${type} {
            transform: scale(1.2) rotate(5deg);
            opacity: 0.8;
          }
        }

        /* Icon container with blob background - Responsive sizes */
        .icon-blob-container-${type} {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        /* Mobile: 40px icons */
        @media (max-width: 767px) {
          .icon-blob-container-${type} {
            width: 40px;
            height: 40px;
            margin-bottom: 0.75rem;
          }
        }

        /* Tablet: 48px icons */
        @media (min-width: 768px) and (max-width: 1023px) {
          .icon-blob-container-${type} {
            width: 48px;
            height: 48px;
            margin-bottom: 1rem;
          }
        }

        /* Desktop: 56px icons */
        @media (min-width: 1024px) {
          .icon-blob-container-${type} {
            width: 56px;
            height: 56px;
            margin-bottom: 1.5rem;
          }
        }

        /* Icon animation - Desktop only */
        .icon-${type} {
          position: relative;
          z-index: 10;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }

        @media (min-width: 1024px) {
          .animal-card-${type}:hover .icon-${type} {
            transform: scale(1.15) translateY(-8px);
          }
        }

        /* Card lift on hover - Desktop only */
        @media (min-width: 1024px) {
          .animal-card-${type}:hover {
            transform: translateY(-12px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 60px ${pastelColor}40;
          }

          .animal-card-${type}:active {
            transform: translateY(-6px);
          }
        }

        /* Border glow - Desktop only */
        .border-glow-${type} {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 2px solid ${borderColor};
          opacity: 0.3;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @media (min-width: 1024px) {
          .animal-card-${type}:hover .border-glow-${type} {
            opacity: 0.6;
            box-shadow: inset 0 0 20px ${borderColor}40;
          }
        }

        /* Content fade on hover */
        .card-content-${type} {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Description animation */
        .description-${type} {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        @media (min-width: 1024px) {
          .animal-card-${type}:hover .description-${type} {
            opacity: 0.9;
            transform: translateY(-2px);
          }
        }

        /* Arrow animation - Desktop only */
        .arrow-${type} {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform;
        }

        @media (min-width: 1024px) {
          .animal-card-${type}:hover .arrow-${type} {
            transform: translateX(4px) scale(1.1);
          }
        }

        /* Shine effect - Desktop only */
        .shine-${type} {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          pointer-events: none;
        }

        @media (min-width: 1024px) {
          .animal-card-${type}:hover .shine-${type} {
            animation: shine-sweep-${type} 0.6s ease-out;
          }
        }

        @keyframes shine-sweep-${type} {
          0% {
            transform: translateX(-100%);
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}
    </style>

    <button
      onClick={onClick}
      disabled={disabled}
      className={`animal-card-${type} group relative rounded-2xl overflow-hidden border-2 ${borderColor} disabled:cursor-not-allowed transition-all duration-300`}
    >
      {/* Pastel background */}
      <div
        className="absolute inset-0 bg-gradient-to-br"
        style={{
          backgroundColor: pastelColor,
        }}
      />

      {/* Subtle dot pattern overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Border glow effect */}
      <div className={`border-glow-${type} pointer-events-none`} />

      {/* Main Content - Responsive padding and height */}
      <div className={`card-content-${type} relative px-5 md:px-6 lg:px-8 py-5 md:py-6 lg:py-12 flex flex-col items-center justify-center text-center lg:min-h-[300px]`}>
        {/* Icon with Organic Blob Background */}
        <div className={`icon-blob-container-${type}`}>
          {/* Organic blob background */}
          <div
            className={`blob-${type}`}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: accentColor,
              position: 'absolute',
              zIndex: 1,
            }}
          />

          {/* Icon */}
          <Icon
            className={`icon-${type} h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 ${textColor}`}
            strokeWidth={1.5}
          />
        </div>

        {/* Title - Responsive text size */}
        <h3 className={`text-lg md:text-xl lg:text-2xl font-bold mb-2 ${textColor} transition-all duration-300`}>
          {label}
        </h3>

        {/* Description - Responsive text size and spacing */}
        <p className={`description-${type} text-xs md:text-sm lg:text-sm text-muted-foreground mb-4 md:mb-6 opacity-75 max-w-xs`}>
          Produits spécialisés pour les {label.toLowerCase()}
        </p>

        {/* Arrow Icon - Responsive size */}
        <div className={`arrow-${type} inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full bg-white/30 backdrop-blur-sm group-hover:bg-white/50 opacity-90 transition-all`}>
          <ArrowRight className={`h-4 w-4 md:h-5 md:w-5 ${textColor}`} />
        </div>
      </div>

      {/* Shine effect */}
      <div className={`shine-${type}`} />
    </button>
    </>
  )
}
