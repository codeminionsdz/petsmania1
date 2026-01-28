"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBrowserClient } from "@supabase/ssr"
import { useTranslation } from "@/hooks/use-translation"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const redirectParam = searchParams?.get("redirect")
  let incomingOrderIdForLinks = searchParams?.get("orderId")
  if (!incomingOrderIdForLinks && redirectParam) {
    try {
      const parts = redirectParam.split('?')
      if (parts.length > 1) {
        const params = new URLSearchParams(parts[1])
        incomingOrderIdForLinks = params.get('orderId')
      }
    } catch (e) {
      // ignore
    }
  }
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  // Auto-fill phone if coming from track order
  useEffect(() => {
    const phoneParam = searchParams?.get("phone")
    if (phoneParam) {
      setFormData((prev) => ({
        ...prev,
        phone: phoneParam,
      }))
    }
  }, [searchParams])

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
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.password) {
      setError(t("register.error_all_fields"))
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("register.error_passwords"))
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError(t("register.error_min_password"))
      setIsLoading(false)
      return
    }

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Generate a unique email from phone for Supabase Auth (hidden from user)
      const generatedEmail = `phone-${formData.phone}@parapharmacie.local`

      console.log("Attempting to sign up with phone:", formData.phone)

      // Sign up with Supabase Auth (using generated email internally)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: generatedEmail,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      console.log("Sign up response:", { data, error: signUpError })

      if (signUpError) {
        const raw = signUpError.message || ""
        const isDuplicate = /already registered|already exists|user already registered|duplicate/i.test(raw)
        setError(isDuplicate ? t("register.error_phone_exists") : raw)
        setIsLoading(false)
        return
      }

      if (data.user) {
        console.log("User created:", data.user.id)

        // Create user profile via server endpoint (uses admin client to bypass RLS)
        try {
          console.log("Creating profile for new user via API")
          const profileResp = await fetch("/api/auth/create-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              email: generatedEmail,
              phone: formData.phone,
              first_name: formData.firstName,
              last_name: formData.lastName,
            }),
          })

          if (profileResp.ok) {
            console.log("✅ Profile created successfully via API")
          } else {
            console.warn("Failed to create profile via API:", profileResp.status)
            const errorData = await profileResp.json()
            console.warn("Error details:", errorData)
            // We proceed with registration even if profile creation fails
            // The user can still access their orders if they're linked via phone
            console.warn("⚠️ Profile setup had an issue, but continuing registration. User will still be able to access their orders.")
          }
        } catch (profileErr) {
          console.warn("Failed to call create-profile API:", profileErr)
          // Don't fail registration if profile creation fails
          console.warn("⚠️ Profile setup had an issue, but continuing registration. User will still be able to access their orders.")
        }


        // Link any guest orders to the new user account via API
        try {
          console.log("Linking guest orders and addresses to new user via API")

          const linkOrderId = searchParams?.get("orderId")
          const linkResponse = await fetch("/api/auth/link-guest-orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              phone: formData.phone,
              orderId: linkOrderId,
            }),
          })

          if (linkResponse.ok) {
            console.log("✅ Guest orders linked successfully via API")
          } else {
            console.warn("Failed to link guest orders via API:", linkResponse.status)
            // Don't fail registration if linking fails
          }
        } catch (linkErr) {
          console.warn("Failed to call link-guest-orders API:", linkErr)
          // Don't fail registration if linking fails
        }

        // Determine incoming orderId: either direct param or inside a redirect param
        const redirectParam = searchParams?.get("redirect")
        let incomingOrderId = searchParams?.get("orderId")
        if (!incomingOrderId && redirectParam) {
          try {
            const parts = redirectParam.split('?')
            if (parts.length > 1) {
              const params = new URLSearchParams(parts[1])
              incomingOrderId = params.get('orderId')
            }
          } catch (parseErr) {
            console.warn('Failed to parse redirect param for orderId', parseErr)
          }
        }

        if (incomingOrderId) {
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: generatedEmail,
              password: formData.password,
            })

            if (signInError) {
              console.warn("Auto sign-in failed, redirecting to login:", signInError)
              setTimeout(() => {
                router.push(`/login?registered=true&redirect=${encodeURIComponent(`/track-order?orderId=${incomingOrderId}`)}`)
              }, 1000)
            } else {
              // Signed in — send them back to the track page so they can view the order
              // ✅ Wait for session to be fully established
              setTimeout(() => {
                router.push(`/track-order?orderId=${encodeURIComponent(incomingOrderId)}&registered=true`)
              }, 1000)
            }
          } catch (siErr) {
            console.warn("Auto sign-in exception:", siErr)
            setTimeout(() => {
              router.push(`/login?registered=true&redirect=${encodeURIComponent(`/track-order?orderId=${incomingOrderId}`)}`)
            }, 1000)
          }
        } else {
          // No incoming order, go directly to My Orders
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: generatedEmail,
              password: formData.password,
            })

            if (signInError) {
              console.warn("Auto sign-in failed after registration:", signInError)
              setTimeout(() => {
                router.push("/login?registered=true")
              }, 1000)
            } else {
              // Successfully signed in, go to My Orders
              setTimeout(() => {
                router.push("/account/orders")
              }, 1000)
            }
          } catch (siErr) {
            console.warn("Auto sign-in exception:", siErr)
            router.push("/login?registered=true")
          }
        }
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError(err instanceof Error ? err.message : "Registration failed")
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
                {t("register.home")}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li className="text-foreground font-medium">{t("register.title")}</li>
          </ol>
        </div>
      </nav>

      <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <h1 className="text-2xl font-bold mb-2">{t("register.title")}</h1>
            <p className="text-muted-foreground mb-6">{t("register.subtitle")}</p>

            {/* Show phone number reminder if coming from track order */}
            {searchParams?.get("phone") && (
              <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                <AlertDescription className="text-sm">
                  ✅ <strong>تم العثور على طلبيتك!</strong> سيتم ربط الطلبية برقم الهاتف: <strong>{searchParams.get("phone")}</strong>
                  <br />
                  <span className="text-xs opacity-75">يرجى ملء البيانات أدناه لإكمال التسجيل</span>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t("register.first_name")}</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Ahmed"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t("register.last_name")}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Benali"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">{t("register.phone") || "Phone Number"}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0555 00 00 00"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading || !!searchParams?.get("phone")}
                  required
                />
                {searchParams?.get("phone") && (
                  <p className="text-xs text-muted-foreground mt-1">
                    رقم الهاتف من الطلبية (لا يمكن تعديله)
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">{t("register.password")}</Label>
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

              <div>
                <Label htmlFor="confirmPassword">{t("register.confirm_password")}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("register.creating") : t("register.button")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {t("register.already")} {" "}
                <Link
                  href={
                    redirectParam
                      ? `/login?redirect=${encodeURIComponent(redirectParam)}`
                      : incomingOrderIdForLinks
                      ? `/login?redirect=${encodeURIComponent(`/track-order?orderId=${incomingOrderIdForLinks}`)}`
                      : '/login'
                  }
                  className="text-primary hover:underline font-medium"
                >
                  {t("register.signin")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
