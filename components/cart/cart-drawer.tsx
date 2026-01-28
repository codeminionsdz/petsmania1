"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/format"
import { CartItem } from "./cart-item"

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, itemCount } = useCart()

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
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button onClick={closeCart} asChild>
              <Link href="/categories">Start Shopping</Link>
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
