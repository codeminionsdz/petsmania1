"use client"

import { Heart, Sparkles, Users, Shield } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { useLanguage } from "@/lib/language-context"

export function WhyPetsMania() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const isRTL = language === "ar"

  const trustItems = [
    {
      icon: Heart,
      titleKey: "home.trust_quality",
      descKey: "home.trust_quality_desc",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Sparkles,
      titleKey: "home.trust_love",
      descKey: "home.trust_love_desc",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: Users,
      titleKey: "home.trust_expert",
      descKey: "home.trust_expert_desc",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Shield,
      titleKey: "home.trust_support",
      descKey: "home.trust_support_desc",
      color: "bg-blue-100 text-blue-600",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-orange-50 via-transparent to-transparent">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {t("home.why_petsmania")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.why_subtitle")}
          </p>
        </div>

        {/* Trust Cards Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isRTL ? "direction-rtl" : ""}`}>
          {trustItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.titleKey}
                className="group relative bg-white rounded-pet-lg p-8 shadow-pet-soft hover:shadow-pet-lg transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] border border-border"
              >
                {/* Icon Container */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${item.color} mb-6 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {t(item.titleKey as any)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(item.descKey as any)}
                </p>

                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              </div>
            )
          })}
        </div>

        {/* Optional decorative elements */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            ✨ {language === "ar" ? "اختر Pets Mania لرفاهية حيوانك الأليف" : language === "fr" ? "Choisissez Pets Mania pour le bien-être de votre animal" : "Choose Pets Mania for your pet's happiness"} ✨
          </p>
        </div>
      </div>
    </section>
  )
}
