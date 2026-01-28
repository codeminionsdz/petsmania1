"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Lock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const ADMIN_PASSWORD = "admin2026"

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate a small delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (password === ADMIN_PASSWORD) {
      // Set admin session in localStorage
      localStorage.setItem("admin_authenticated", "true")
      localStorage.setItem("admin_auth_time", Date.now().toString())

      toast({
        title: "Bienvenue Admin",
        description: "Connexion réussie au tableau de bord.",
      })

      router.push("/admin")
    } else {
      setError("Mot de passe incorrect")
      toast({
        title: "Erreur",
        description: "Mot de passe incorrect. Veuillez réessayer.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-2xl border border-border p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Image src="/images/image.png" alt="PharmaCare Logo" width={60} height={60} className="rounded-full" />
            </div>
            <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Administration
            </h1>
            <p className="text-muted-foreground mt-2">Entrez le mot de passe pour accéder au tableau de bord</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez le mot de passe admin"
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {error && <p className="text-sm text-destructive mt-1">{error}</p>}
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Connexion...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">Accès réservé aux administrateurs autorisés</p>
          </div>
        </div>
      </div>
    </div>
  )
}
