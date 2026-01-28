"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronRight, Lock, Truck, CreditCard, Banknote, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import { useLanguage } from "@/lib/language-context"
import { getTranslation } from "@/lib/translations"
import type { Wilaya } from "@/lib/types"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { language } = useLanguage()
  const t = (key: string) => getTranslation(language as "en" | "fr" | "ar", key as any)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedWilaya, setSelectedWilaya] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [error, setError] = useState<string>("")
  const [promoError, setPromoError] = useState<string>("")
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [loadingWilayas, setLoadingWilayas] = useState(true)
  const [settings, setSettings] = useState<any>(null)

  // Load wilayas and settings on mount
  useEffect(() => {
    fetchWilayasAndSettings()
  }, [])

  const fetchWilayasAndSettings = async () => {
    try {
      setLoadingWilayas(true)
      
      // Fetch wilayas from database
      const wilayasRes = await fetch("/api/wilayas")
      const wilayasData = await wilayasRes.json()
      if (wilayasData.success) {
        setWilayas(wilayasData.data)
      }

      // Fetch settings for free shipping threshold
      const settingsRes = await fetch("/api/admin/settings")
      const settingsData = await settingsRes.json()
      if (settingsData.success) {
        setSettings(settingsData.data)
      }
    } catch (error) {
      console.error("Error fetching wilayas and settings:", error)
    } finally {
      setLoadingWilayas(false)
    }
  }

  const selectedWilayaData = wilayas.find((w) => w.id === selectedWilaya)
  const shippingCost = selectedWilayaData?.shippingCost || 0
  const freeShippingThreshold = settings?.free_shipping_threshold || 8000
  const isFreeShipping = subtotal >= freeShippingThreshold && (settings?.enable_free_shipping ?? true)
  const finalShipping = isFreeShipping ? 0 : shippingCost
  const total = subtotal - promoDiscount + finalShipping

  const handleApplyPromo = async () => {
    setPromoError("")
    
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code")
      return
    }

    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal }),
      })

      const data = await response.json()

      if (!data.success) {
        setPromoError(data.error || "Invalid promo code")
        return
      }

      setPromoDiscount(data.data.discountAmount)
      setPromoApplied(true)
      setPromoError("")
    } catch (err) {
      console.error("Error applying promo code:", err)
      setPromoError("Error applying promo code. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const formData = new FormData(e.currentTarget)
      
      const orderData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        municipality: formData.get("municipality"),
        city: formData.get("city"),
        wilaya: selectedWilaya,
        postalCode: formData.get("postalCode"),
        guestEmail: formData.get("guestEmail"),
        items,
        subtotal,
        shipping: finalShipping,
        discount: promoDiscount,
        total,
        paymentMethod,
        promoCode: promoApplied ? promoCode : null,
      }

      console.log("Submitting order data:", orderData)

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to create order")
      }

      const { data: order } = responseData

      clearCart()
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create order"
      console.error("Order submission error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">{t("checkout.empty_cart")}</h1>
          <p className="text-muted-foreground mb-6">{t("checkout.empty_message")}</p>
          <Button asChild>
            <Link href="/categories">{t("checkout.continue_shopping")}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="bg-secondary py-3">
        <div className="container mx-auto px-4">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li>
              <Link href="/cart" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("header.cart")}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li className="text-foreground font-medium">{t("checkout.title")}</li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">{t("checkout.title")}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Contact Information */}
              <section className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">{t("checkout.contact_info")}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("checkout.first_name")}</Label>
                    <Input id="firstName" name="firstName" required placeholder={language === "ar" ? "أدخل اسمك الأول" : language === "fr" ? "Entrez votre prénom" : "Enter your first name"} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("checkout.last_name")}</Label>
                    <Input id="lastName" name="lastName" required placeholder={language === "ar" ? "أدخل اسم عائلتك" : language === "fr" ? "Entrez votre nom de famille" : "Enter your last name"} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("checkout.phone")}</Label>
                    <Input id="phone" name="phone" type="tel" required placeholder="0555 00 00 00" />
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">{t("checkout.shipping_address")}</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">{t("checkout.street_address")}</Label>
                    <Input id="address" name="address" required placeholder={language === "ar" ? "أدخل عنوان شارعك" : language === "fr" ? "Entrez votre adresse postale" : "Enter your street address"} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wilaya">{t("checkout.wilaya")}</Label>
                      <Select value={selectedWilaya} onValueChange={setSelectedWilaya} required>
                        <SelectTrigger>
                          <SelectValue placeholder={language === "ar" ? "اختر الولاية" : language === "fr" ? "Sélectionner la wilaya" : "Select wilaya"} />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya.id} value={wilaya.id}>
                              {wilaya.code} - {wilaya.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="municipality">{t("checkout.municipality")}</Label>
                      <Input id="municipality" name="municipality" required placeholder={language === "ar" ? "أدخل البلدية الخاصة بك" : language === "fr" ? "Entrez votre municipalité" : "Enter your municipality"} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("checkout.city")}</Label>
                    <Input id="city" name="city" required placeholder={language === "ar" ? "أدخل مدينتك" : language === "fr" ? "Entrez votre ville" : "Enter your city"} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">{t("checkout.postal_code")}</Label>
                    <Input id="postalCode" name="postalCode" placeholder="e.g., 16000" />
                  </div>
                  {selectedWilayaData && (
                    <p className="text-sm text-muted-foreground">
                      {t("checkout.estimated_delivery")} {selectedWilayaData.deliveryDays} {selectedWilayaData.deliveryDays > 1 ? t("checkout.business_days") : t("checkout.business_day")}
                    </p>
                  )}
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">{t("checkout.payment_method")}</h2>
                </div>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Banknote className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t("checkout.cash_on_delivery")}</p>
                          <p className="text-sm text-muted-foreground">{t("checkout.pay_on_delivery")}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <RadioGroupItem value="ccp" id="ccp" />
                    <Label htmlFor="ccp" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t("checkout.ccp_payment")}</p>
                          <p className="text-sm text-muted-foreground">{t("checkout.bank_transfer")}</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </section>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">{t("checkout.order_summary")}</h2>

                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-secondary rounded-md">
                        <Image
                          src={item.product.images[0] || "/placeholder.svg?height=64&width=64&query=product"}
                          alt={item.product.name}
                          fill
                          className="object-contain p-1"
                        />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(item.product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="mb-4">
                  <Label htmlFor="promo" className="text-sm">
                    {t("checkout.promo_code")}
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder={language === "ar" ? "أدخل الرمز" : language === "fr" ? "Entrez le code" : "Enter code"}
                      disabled={promoApplied}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={handleApplyPromo} disabled={promoApplied}>
                      {promoApplied ? t("checkout.applied") : t("checkout.apply")}
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-destructive mt-1">{promoError}</p>
                  )}
                  {!promoApplied && (
                    <p className="text-xs text-muted-foreground mt-1">Try: WELCOME20</p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 text-sm border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>{t("checkout.promo_code")}</span>
                      <span>-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkout.shipping")}</span>
                    <span>
                      {!selectedWilaya ? (
                        t("checkout.select_wilaya")
                      ) : isFreeShipping ? (
                        <span className="text-green-600">{t("checkout.free")}</span>
                      ) : (
                        formatPrice(finalShipping)
                      )}
                    </span>
                  </div>
                  {!isFreeShipping && subtotal > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {language === "ar" 
                        ? `أضف ${formatPrice(freeShippingThreshold - subtotal)} لاشتراط الشحن المجاني`
                        : language === "fr"
                        ? `Ajouter ${formatPrice(freeShippingThreshold - subtotal)} pour la livraison gratuite`
                        : `Add ${formatPrice(freeShippingThreshold - subtotal)} more for free shipping`
                      }
                    </p>
                  )}
                </div>

                <div className="border-t border-border my-4 pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{t("checkout.total")}</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !selectedWilaya}>
                  <Lock className="mr-2 h-4 w-4" />
                  {isSubmitting ? t("checkout.processing") : t("checkout.place_order")}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  {t("checkout.terms_agreement")}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

