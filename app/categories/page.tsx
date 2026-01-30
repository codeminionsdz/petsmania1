import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, PawPrint } from "lucide-react"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Catégories par Animal | PharmaCare",
  description:
    "Parcourez les produits pour votre animal de compagnie - Chats, Chiens, Oiseaux et autres animaux.",
}

export default async function CategoriesPage() {
  // Animal-centric redirect - no more global category listing
  // Users should browse by animal instead
  const animals = [
    { name: "Chats", slug: "cats", emoji: "🐱", description: "Produits et soins pour chats" },
    { name: "Chiens", slug: "dogs", emoji: "🐕", description: "Produits et soins pour chiens" },
    { name: "Oiseaux", slug: "birds", emoji: "🐦", description: "Produits et soins pour oiseaux" },
    {
      name: "Autres Animaux",
      slug: "others",
      emoji: "🐾",
      description: "Produits pour lapins, hamsters, et autres animaux",
    },
  ]

  return (
    <>
      <CartDrawer />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Catégories" }]} />

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Catégories par Animal</h1>
          <p className="text-muted-foreground text-lg">
            Sélectionnez l'animal de votre choix pour voir les catégories disponibles
          </p>
        </div>

        {/* Animal Selection Grid */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {animals.map((animal) => (
              <Link
                key={animal.slug}
                href={`/${animal.slug}/categories`}
                className="group relative overflow-hidden rounded-lg border-2 border-transparent bg-card p-6 transition-all duration-300 hover:border-primary hover:shadow-lg"
              >
                <div className="space-y-3">
                  <div className="text-5xl">{animal.emoji}</div>
                  <h2 className="text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
                    {animal.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{animal.description}</p>

                  <div className="flex items-center gap-2 pt-2 text-primary opacity-0 transition-all group-hover:opacity-100">
                    <span className="text-sm font-medium">Voir les catégories</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Hover effect background */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>

        {/* Information Section */}
        <section className="rounded-lg bg-muted/50 p-8 space-y-4">
          <div className="flex items-start gap-3">
            <PawPrint className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Comment naviguer ?</h3>
              <p className="text-muted-foreground">
                Commencez par sélectionner l'animal pour lequel vous recherchez des produits. Vous verrez alors toutes
                les catégories disponibles spécifiquement adaptées à cet animal.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
