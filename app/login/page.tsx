"use client"

import { useState, Suspense, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBrowserClient } from "@supabase/ssr"
import { useTranslation } from "@/hooks/use-translation"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"
  const registered = searchParams.get("registered")
  const unconfirmed = searchParams.get("unconfirmed")
  const { t } = useTranslation()

  // Debug: log redirect parameter
  useEffect(() => {
    console.log("Login page redirect param:", redirect)
  }, [redirect])

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validation
    if (!formData.phone || !formData.password) {
      setError(t("login.error_all_fields"))
      setIsLoading(false)
      return
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Generate email from phone for auth (same as in register)
      const generatedEmail = `phone-${formData.phone}@petsmania.local`

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: generatedEmail,
        password: formData.password,
      })

      if (signInError) {
        // Handle specific error messages
        if (signInError.message.includes("Email not confirmed")) {
          setError(t("login.error_not_confirmed"))
        } else if (signInError.message.includes("Invalid login credentials")) {
          setError(t("login.error_invalid"))
        } else {
          setError(signInError.message || t("login.error_invalid"))
        }
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Redirect to original page or home
        console.log("✅ Login successful, redirecting to:", redirect)
        console.log("User ID:", data.user.id)
        
        // Wait a bit to ensure session is fully established
        // Then use router.push with a delay to let Supabase sync session
        setTimeout(() => {
          router.push(redirect)
        }, 1000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="bg-secondary py-3">
        <div className="container mx-auto px-4">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("login.home")}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li className="text-foreground font-medium">{t("login.title")}</li>
          </ol>
        </div>
      </nav>

      <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <h1 className="text-2xl font-bold mb-2">{t("login.title")}</h1>
            <p className="text-muted-foreground mb-6">{t("login.subtitle")}</p>

            {registered && !unconfirmed && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  {t("login.success_msg")}
                </AlertDescription>
              </Alert>
            )}

            {registered && unconfirmed && (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  {t("login.confirm_msg")}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("login.email")}</Label>
                <Input
                  id="email"
                  name="phone"
                  type="text"
                  placeholder="0555 00 00 00"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">{t("login.password")}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("login.signing") : t("login.button")}
              </Button>
            </form>

            <div className="mt-6 space-y-4 text-center">
              <Link href="#" className="block text-primary hover:underline text-sm">
                {t("login.forgot")}
              </Link>
              <p className="text-muted-foreground">
                {t("login.no_account")} {" "}
                <Link
                  href={`/register?redirect=${encodeURIComponent(redirect)}`}
                  className="text-primary hover:underline font-medium"
                >
                  {t("login.create")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
