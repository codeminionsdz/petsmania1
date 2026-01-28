import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ClientLayout } from "@/components/layout/client-layout"
import { CartProvider } from "@/lib/cart-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Parapharmacie l'Olivier | Votre Parapharmacie en Ligne de Confiance",
  description:
    "Produits parapharmaceutiques premium livrés à Souk Ahras. Soins de la peau, vitamines, santé et bien-être des marques européennes de confiance.",
  keywords: ["parapharmacie", "pharmacie", "soins de la peau", "vitamines", "santé", "bien-être", "algérie", "souk ahras"],
  generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning dir="ltr">
      <body className={`${inter.className} font-sans antialiased`} suppressHydrationWarning>
        <CartProvider>
          <WishlistProvider>
            <ClientLayout>{children}</ClientLayout>
          </WishlistProvider>
        </CartProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
