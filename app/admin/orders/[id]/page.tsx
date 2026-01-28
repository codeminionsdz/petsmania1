"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/format"

interface OrderItem {
  id: string
  productId: string
  productName: string
  productPrice: number
  quantity: number
}

interface Order {
  id: string
  createdAt: string
  status: string
  total: number
  subtotal: number
  shipping: number
  discount: number
  paymentMethod: string
  trackingNumber: string | null
  notes: string | null
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    wilaya: string
    phone: string
    email: string
  }
  items: OrderItem[]
  userId: string | null
  guestEmail: string | null
  guestPhone: string | null
}

const STATUS_OPTIONS = [
  { value: "pending", label: "En attente", color: "bg-yellow-500" },
  { value: "confirmed", label: "Confirmée", color: "bg-blue-500" },
  { value: "processing", label: "En préparation", color: "bg-purple-500" },
  { value: "shipped", label: "Expédiée", color: "bg-indigo-500" },
  { value: "delivered", label: "Livrée", color: "bg-green-500" },
  { value: "cancelled", label: "Annulée", color: "bg-red-500" },
]

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [status, setStatus] = useState("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (!id) return
    
    console.log("Fetching order with ID:", id)
    fetch(`/api/admin/orders/${id}`)
      .then((r) => {
        console.log("Response status:", r.status)
        return r.json()
      })
      .then((data) => {
        console.log("Order data received:", data)
        if (data.error) {
          console.error("API error:", data.error)
          setError(data.error)
        } else {
          setOrder(data)
          setStatus(data.status)
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusUpdate = async () => {
    if (!order || status === order.status) return

    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error("Échec de la mise à jour du statut")

      const updated = await res.json()
      setOrder(updated)

      toast({
        title: "Succès",
        description: "Statut de la commande mis à jour",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {error ? `Erreur: ${error}` : "Commande non trouvée"}
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/orders">Retour aux commandes</Link>
        </Button>
      </div>
    )
  }

  const statusInfo = STATUS_OPTIONS.find((s) => s.value === order.status) || STATUS_OPTIONS[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Commande #{order?.id?.slice(4) || order?.id || "N/A"}</h1>
            <p className="text-muted-foreground">
              {order?.createdAt ? new Date(order.createdAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) : "Date non disponible"}
            </p>
          </div>
        </div>
        {order?.status && <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order?.items && order.items.length > 0 ? (
                  <>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.productPrice * item.quantity)}</p>
                          <p className="text-sm text-muted-foreground">{formatPrice(item.productPrice)} × {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Aucun produit</p>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatPrice(order?.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>{formatPrice(order?.shipping || 0)}</span>
                  </div>
                  {order?.discount && order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Réduction</span>
                      <span className="text-destructive">-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(order?.total || 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">
                  {order?.shippingAddress?.firstName} {order?.shippingAddress?.lastName}
                </p>
                <p className="text-muted-foreground">{order?.shippingAddress?.address}</p>
                <p className="text-muted-foreground">
                  {order?.shippingAddress?.city}, {order?.shippingAddress?.wilaya}
                </p>
                <p className="text-muted-foreground">{order?.shippingAddress?.phone}</p>
                <p className="text-muted-foreground">{order?.shippingAddress?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informations de paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Méthode de paiement</span>
                  <span className="font-medium">
                    {order.paymentMethod === "cash" ? "Paiement à la livraison" : order.paymentMethod}
                  </span>
                </div>
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Numéro de suivi</span>
                    <span className="font-medium font-mono">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Statut de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="w-full"
                onClick={handleStatusUpdate}
                disabled={updating || status === order.status}
              >
                {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Mettre à jour le statut
              </Button>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.userId ? (
                  <>
                    <p className="font-medium">Compte client</p>
                    <p className="text-sm text-muted-foreground">ID: {order.userId.slice(0, 8)}</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Client invité</p>
                    {order.guestEmail && (
                      <p className="text-sm text-muted-foreground">{order.guestEmail}</p>
                    )}
                    {order.guestPhone && (
                      <p className="text-sm text-muted-foreground">{order.guestPhone}</p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Chronologie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Commande créée</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
