"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import { useLanguage } from "@/lib/language-context"

function HeroCarouselContent() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const isRTL = language === "ar"
  
  const heroSlides: Array<{
    id: number
    badgeKey: string
    titleKey: string
    descriptionKey: string
    primaryBtnKey: string
    secondaryBtnKey: string
    primaryBtnHref: string
    secondaryBtnHref: string
    backgroundImage: string
    icon: any
    gradientOpacity: string
  }> = [
    {
      id: 1,
      badgeKey: "hero.satisfied",
      titleKey: "hero.health",
      descriptionKey: "hero.health_desc",
      primaryBtnKey: "hero.buy_now",
      secondaryBtnKey: "hero.explore_brands",
      primaryBtnHref: "/categories",
      secondaryBtnHref: "/brands",
      backgroundImage: "/baner1.jfif",
      icon: Heart,
      gradientOpacity: "rgb(255, 255, 255) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.2)",
    },
    {
      id: 2,
      badgeKey: "hero.new",
      titleKey: "hero.collections",
      descriptionKey: "hero.collections_desc",
      primaryBtnKey: "hero.view_new",
      secondaryBtnKey: "hero.browse_all",
      primaryBtnHref: "/categories",
      secondaryBtnHref: "/products",
      backgroundImage: "/baner2.jpg",
      icon: Sparkles,
      gradientOpacity: "rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.25)",
    },
    {
      id: 3,
      badgeKey: "hero.promo",
      titleKey: "hero.discount",
      descriptionKey: "hero.discount_desc",
      primaryBtnKey: "hero.see_promo",
      secondaryBtnKey: "hero.our_brands",
      primaryBtnHref: "/categories",
      secondaryBtnHref: "/brands",
      backgroundImage: "/baner3.avif",
      icon: Star,
      gradientOpacity: "rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.25)",
    },
  ]
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      direction: isRTL ? "rtl" : "ltr",
    }, 
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Reinitialize carousel when language changes (for RTL support)
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit({
        direction: isRTL ? "rtl" : "ltr",
      })
    }
  }, [isRTL, emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on("select", onSelect)
    onSelect()

    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  const scrollTo = (index: number) => emblaApi?.scrollTo(index)

  return (
    <div className="relative overflow-hidden">
      <div className="relative overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {heroSlides.map((slide, index) => {
            const Icon = slide.icon
            return (
              <div key={slide.id} className="flex-[0_0_100%] min-w-0 shrink-0">
                <section 
                  className="relative overflow-hidden min-h-[500px] md:min-h-[600px]"
                  style={{
                    backgroundImage: `url('${slide.backgroundImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: '#8bb895',
                  }}
                >
                  {/* Overlay gradient for better text contrast */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)`,
                    }}
                  />

                  <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-32 z-10">
                  <div className="max-w-3xl mx-auto text-center">
                    {/* Animated badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 backdrop-blur-sm border border-teal-400 text-white text-sm font-semibold rounded-full mb-6 shadow-lg animate-fade-in-up hover:bg-teal-700 transition-colors">
                      <Icon className="h-4 w-4 animate-pulse" />
                      <span>{t(slide.badgeKey as any)}</span>
                    </div>

                    {/* Title with stagger animation */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up !text-white">
                      {t(slide.titleKey as any).split("\n").map((line, i) => (
                        <span key={i} className="block">
                          {line}
                        </span>
                      ))}
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-white leading-relaxed max-w-2xl mx-auto mb-8 animate-fade-in-up font-semibold">
                      {t(slide.descriptionKey as any)}
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
                      <Button size="lg" className="group shadow-xl hover:shadow-2xl transition-all bg-teal-600 hover:bg-teal-700 text-white font-semibold" asChild>
                        <Link href={slide.primaryBtnHref}>
                          {t(slide.primaryBtnKey as any)}
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" className="bg-white text-gray-900 shadow-xl hover:bg-gray-50 font-semibold border-2 border-white hover:shadow-2xl transition-all" asChild>
                        <Link href={slide.secondaryBtnHref}>{t(slide.secondaryBtnKey as any)}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )
        })}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-3 rounded-full transition-all duration-300 shadow-lg",
              index === selectedIndex
                ? "w-8 bg-teal-500 shadow-teal-500/50"
                : "w-3 bg-white/50 hover:bg-white/75"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export function HeroCarousel() {
  return <HeroCarouselContent />
}