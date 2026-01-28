"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Percent, Tag, TrendingDown, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { createClient } from "@supabase/supabase-js"

interface Settings {
  max_discount_percentage: number
  show_promotions_banner: boolean
  promotion_banner_title: string
  free_shipping_threshold: number
  enable_free_shipping: boolean
}

interface Promotion {
  id: string
  title: string
  description: string
  category?: string
  badge?: string
  discount_percentage?: number
  discount_fixed?: number
  start_date: string
  end_date: string
  is_active: boolean
}

const promotionCategories = [
  {
    id: 1,
    title: "Promotions du moment",
    description: "Les meilleures offres disponibles maintenant",
    icon: Percent,
    color: "from-red-500 to-pink-600",
    href: "/categories/visage",
  },
  {
    id: 2,
    title: "Nouveautés en promotion",
    description: "Découvrez les nouveaux produits à prix réduit",
    icon: Tag,
    color: "from-purple-500 to-indigo-600",
    href: "/categories/cheveux",
  },
  {
    id: 3,
    title: "Jusqu'à -50%",
    description: "Les plus grandes réductions sur vos produits préférés",
    icon: TrendingDown,
    color: "from-orange-500 to-red-600",
    href: "/categories/corps",
  },
  {
    id: 4,
    title: "Offres limitées",
    description: "Profitez-en avant qu'il ne soit trop tard",
    icon: Clock,
    color: "from-teal-500 to-cyan-600",
    href: "/categories/maman-bebe",
  },
]

export default function PromotionsPage() {
  const breadcrumbItems = [{ label: "Promotions" }]
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  const [settings, setSettings] = useState<Settings | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
    fetchPromotions()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPromotions(data || [])
    } catch (error) {
      console.error("Error fetching promotions:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      {settings?.show_promotions_banner && (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary to-accent p-8 md:p-12 mb-12 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Percent className="h-8 w-8" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Promotions & Offres</h1>
            </div>
            <p className="text-lg text-white/90 max-w-2xl mb-6">
              Découvrez nos meilleures offres et promotions sur une large sélection de produits de parapharmacie
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-base py-2 px-4">
                0 produits en promotion
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-base py-2 px-4">
                {settings?.promotion_banner_title}
              </Badge>
              {settings?.enable_free_shipping && (
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-base py-2 px-4">
                  Livraison gratuite dès {settings?.free_shipping_threshold} DZD
                </Badge>
              )}
            </div>
          </div>
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
          </div>
        </div>
      )}

      {/* Promotion Categories */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Catégories en promotion</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {promotionCategories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.id}
                href={category.href}
                className="group relative overflow-hidden rounded-xl border border-border transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1.5"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`} />

                <div className="absolute inset-0 opacity-10">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                </div>

                <div className="relative p-6">
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm w-fit mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{category.title}</h3>
                  <p className="text-sm text-white/90">{category.description}</p>
                </div>

                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Upcoming Promotions */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Prochaines promotions</h2>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement...
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune promotion active pour le moment
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <Card key={promo.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  {promo.badge && <Badge variant="secondary">{promo.badge}</Badge>}
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                <p className="text-muted-foreground mb-4">{promo.description}</p>
                {(promo.discount_percentage || promo.discount_fixed) && (
                  <div className="mb-4 font-bold text-primary text-lg">
                    {promo.discount_percentage
                      ? `Jusqu'à -${promo.discount_percentage}%`
                      : `Réduction: ${promo.discount_fixed} DZD`
                    }
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Du {promo.start_date} au {promo.end_date}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="mt-16 bg-secondary rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Restez informé de nos promotions</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Inscrivez-vous à notre newsletter pour recevoir en avant-première nos offres exclusives et promotions
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <Button size="lg" className="w-full sm:w-auto">
            S'inscrire à la newsletter
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/categories">Voir toutes les catégories</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
