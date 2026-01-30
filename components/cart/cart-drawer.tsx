"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCart } from "@/lib/cart-context"
import { useTranslation } from "@/hooks/use-translation"
import { formatPrice } from "@/lib/format"
import { CartItem } from "./cart-item"

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, itemCount } = useCart()
  const { t } = useTranslation()

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="mb-6">
              <div className="inline-block p-4 bg-orange-100 rounded-full mb-4">
                <ShoppingBag className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2 text-foreground">{t("empty.cart_title")}</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t("empty.cart_message")}
            </p>
            <Button onClick={closeCart} asChild className="w-full">
              <Link href="/categories">{t("empty.browse")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </ScrollArea>

            <div className="border-t border-border pt-4 mt-auto space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-lg">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Shipping calculated at checkout</p>
              <div className="flex flex-col gap-2">
                <Button size="lg" asChild onClick={closeCart}>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
