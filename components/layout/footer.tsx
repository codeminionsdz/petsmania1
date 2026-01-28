"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, Phone, MapPin, Truck, Shield, CreditCard, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"

function FooterContent() {
  const { t } = useTranslation()

  const footerLinks = {
    shop: [
      { name: t("footer.all_categories"), href: "/categories" },
      { name: t("footer.skincare"), href: "/categories/skincare" },
      { name: t("footer.vitamins"), href: "/categories/vitamins-supplements" },
      { name: t("footer.hair_care"), href: "/categories/hair-care" },
      { name: t("footer.baby_mom"), href: "/categories/baby-mom" },
      { name: t("footer.brands"), href: "/brands" },
    ],
    support: [
      { name: t("footer.contact_us"), href: "/contact" },
    ],
  }

  const trustFeatures = [
    { icon: Truck, title: t("footer.fast_delivery"), description: t("footer.fast_delivery_desc") },
    { icon: Shield, title: t("footer.authentic_products"), description: t("footer.authentic_desc") },
    { icon: CreditCard, title: t("footer.secure_payment"), description: t("footer.secure_desc") },
    { icon: Clock, title: t("footer.free_shipping"), description: t("footer.free_shipping_desc") },
  ]
  return (
    <footer className="bg-secondary mt-auto">
      {/* Trust Features */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustFeatures.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative w-12 h-12 bg-white rounded-lg p-1 shadow-sm">
                <Image src="/images/image.png" alt="Parapharmacie l'Olivier" width={48} height={48} className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold text-primary">Parapharmacie l'Olivier</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {t("footer.description")}
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">{t("footer.newsletter")}</h4>
              <div className="flex gap-2">
                <Input type="email" placeholder={t("footer.email_placeholder")} className="bg-background" />
                <Button className="shrink-0">{t("footer.subscribe")}</Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/share/16msr2HLCG/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/parapharmacie_de_lolivier?igsh=MWZmOGNhMHRyeWJmNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.shop")}</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.support")}</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t("footer.contact_info")}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <a 
                  href="https://maps.app.goo.gl/N7o8sWZ7zf9bVn4E7" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("footer.address")}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href="tel:+213770867403" className="text-muted-foreground hover:text-primary">
                  {t("footer.phone")}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href="mailto:Parapharmacielolivier@gmail.com" className="text-muted-foreground hover:text-primary">
                  {t("footer.email")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Parapharmacie l'Olivier. {t("footer.copyright")}
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                {t("footer.privacy")}
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary">
                {t("footer.terms")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export function Footer() {
  return <FooterContent />
}
