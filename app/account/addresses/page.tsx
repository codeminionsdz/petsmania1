"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, MapPin, Plus, Edit2, Trash2, Check, Loader, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@supabase/ssr"
import type { Address } from "@/lib/types"

interface AddressWithId extends Address {
  id: string
  isDefault: boolean
  wilayaName?: string
}

interface Wilaya {
  id: string
  name: string
}

export default function AddressesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<AddressWithId[]>([])
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    wilaya: "",
    postalCode: "",
  })

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Get current user
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          router.push("/login")
          return
        }

        setUserId(authUser.id)

        // Load wilayas
        const { data: wilayasData } = await supabase.from("wilayas").select("id, name").order("name")
        if (wilayasData) {
          setWilayas(wilayasData)
        }

        // Load user addresses from database
        const { data: addressesData, error: addressesError } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", authUser.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false })

        if (addressesError) {
          setError("Failed to load addresses")
          setIsLoading(false)
          return
        }

        if (addressesData && addressesData.length > 0) {
          const formattedAddresses: AddressWithId[] = addressesData.map((addr: any) => {
            const wilayaName = wilayasData?.find((w: any) => w.id === addr.wilaya_id)?.name || null
            return {
              id: addr.id,
              firstName: addr.first_name,
              lastName: addr.last_name,
              phone: addr.phone,
              email: addr.email,
              address: addr.address,
              city: addr.city,
              wilaya: addr.wilaya_id, // Store the wilaya_id
              wilayaName,
              postalCode: addr.postal_code,
              isDefault: addr.is_default,
            }
          })
          setAddresses(formattedAddresses)
        } else {
          // If no addresses, try to get from first order
          const { data: orderData } = await supabase
            .from("orders")
            .select("shipping_address")
            .eq("user_id", authUser.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .single()

          if (orderData && orderData.shipping_address) {
            const shippingAddr = orderData.shipping_address
            const wilayaNameFromList = wilayasData?.find((w: any) => w.id === shippingAddr.wilaya)?.name || null
            const newAddress: AddressWithId = {
              id: "default",
              firstName: shippingAddr.firstName,
              lastName: shippingAddr.lastName,
              phone: shippingAddr.phone,
              email: shippingAddr.email,
              address: shippingAddr.address,
              city: shippingAddr.city,
              wilaya: shippingAddr.wilaya,
              wilayaName: wilayaNameFromList || (shippingAddr.wilayaName ?? null),
              postalCode: shippingAddr.postalCode,
              isDefault: true,
            }
            setAddresses([newAddress])
          }
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error loading addresses:", err)
        setError("Failed to load addresses")
        setIsLoading(false)
      }
    }

    loadAddresses()
  }, [router])

  const handleSetDefault = async (id: string) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Update all addresses to not default
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId)

      // Set selected address as default
      await supabase.from("addresses").update({ is_default: true }).eq("id", id)

      // Update local state
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      )

      toast({ title: "Success", description: "Default address updated" })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return
    }

    try {
      const response = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("API error:", result)
        toast({
          title: "Error",
          description: result.error || "Failed to delete address",
          variant: "destructive",
        })
        return
      }

      setAddresses(addresses.filter((addr) => addr.id !== id))
      toast({ title: "Success", description: "Address deleted successfully" })
    } catch (err) {
      console.error("Error deleting address:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete address",
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (address: AddressWithId) => {
    setEditingId(address.id)
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      email: address.email || "",
      address: address.address,
      city: address.city,
      wilaya: address.wilaya,
      postalCode: address.postalCode,
    })
    setIsOpen(true)
  }

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.wilaya) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!editingId) return

    try {
      setIsSaving(true)

      const url = `/api/account/addresses/${editingId}`
      console.log("🔵 SENDING PUT REQUEST TO:", url)
      
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          wilayaId: formData.wilaya,
          postalCode: formData.postalCode,
        }),
      })

      console.log("Update response status:", response.status)
      
      const result = await response.json()
      console.log("Update response result:", result)

      if (!response.ok) {
        console.error("❌ API error - Status:", response.status, "Result:", result)
        const errorMsg = result?.error || result?.message || "Failed to update address"
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      if (!result?.success) {
        console.error("❌ Update failed - no success flag")
        toast({
          title: "Error",
          description: "Update did not complete successfully",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      if (!result?.data) {
        console.error("❌ No data returned from API")
        toast({
          title: "Error",
          description: "No data returned from server",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      const addr = result.data
      const updatedAddress: AddressWithId = {
        id: addr.id,
        firstName: addr.first_name,
        lastName: addr.last_name,
        phone: addr.phone,
        email: addr.email,
        address: addr.address,
        city: addr.city,
        wilaya: addr.wilaya_id,
        postalCode: addr.postal_code,
        isDefault: addr.is_default,
      }

      setAddresses(
        addresses.map((addr) =>
          addr.id === editingId ? updatedAddress : addr
        )
      )
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        wilaya: "",
        postalCode: "",
      })
      setEditingId(null)
      setIsOpen(false)
      setIsSaving(false)
      toast({
        title: "Success",
        description: "Address updated successfully",
      })
    } catch (err) {
      console.error("Error updating address:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update address",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.wilaya) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      // Use API endpoint for better error handling and server-side validation
      const response = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          wilayaId: formData.wilaya,
          postalCode: formData.postalCode,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("API error:", result)
        toast({
          title: "Error",
          description: result.error || "Failed to save address",
          variant: "destructive",
        })
        return
      }

      if (result.success && result.data) {
        const addr = result.data
        const formattedAddress: AddressWithId = {
          id: addr.id,
          firstName: addr.first_name,
          lastName: addr.last_name,
          phone: addr.phone,
          email: addr.email,
          address: addr.address,
          city: addr.city,
          wilaya: addr.wilaya_id,
          postalCode: addr.postal_code,
          isDefault: addr.is_default,
        }

        setAddresses([formattedAddress, ...addresses])
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          wilaya: "",
          postalCode: "",
        })
        setIsOpen(false)
        toast({
          title: "Success",
          description: "Address saved successfully",
        })
      }
    } catch (err) {
      console.error("Error saving address:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save address",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
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
              <Link href="/account" className="text-muted-foreground hover:text-foreground transition-colors">
                Account
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <li className="text-foreground font-medium">Addresses</li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">My Addresses</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Address" : "Add New Address"}</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={editingId ? handleUpdateAddress : handleSaveAddress}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wilaya">Wilaya</Label>
                    <Select value={formData.wilaya} onValueChange={(value) => setFormData({ ...formData, wilaya: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select wilaya" />
                      </SelectTrigger>
                      <SelectContent>
                        {wilayas.map((wilaya) => (
                          <SelectItem key={wilaya.id} value={wilaya.id}>
                            {wilaya.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsOpen(false)
                      setEditingId(null)
                      setFormData({
                        firstName: "",
                        lastName: "",
                        phone: "",
                        email: "",
                        address: "",
                        city: "",
                        wilaya: "",
                        postalCode: "",
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : editingId ? "Update Address" : "Save Address"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No addresses saved</h2>
            <p className="text-muted-foreground mb-6">Add your first shipping address to speed up checkout.</p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-card border rounded-lg p-6 relative transition-all ${
                  address.isDefault ? "border-primary shadow-md" : "border-border"
                }`}
              >
                {address.isDefault && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-primary text-white rounded-full">
                    <Check className="h-3 w-3" />
                    Default
                  </span>
                )}
                <div className="flex items-start gap-3 pr-20">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-base">
                      {address.firstName} {address.lastName}
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">{address.address}</p>
                    <p className="text-muted-foreground text-sm">
                      {address.city}, {address.wilayaName || wilayas.find(w => w.id === address.wilaya)?.name || address.wilaya} {address.postalCode}
                    </p>
                    <p className="text-muted-foreground text-sm mt-2 font-medium">{address.phone}</p>
                    {address.email && <p className="text-muted-foreground text-sm">{address.email}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleEditClick(address)}>
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
