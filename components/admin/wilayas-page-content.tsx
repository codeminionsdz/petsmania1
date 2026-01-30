"use client"

import { useState } from "react"
import { Plus, Search, Edit2, Trash2, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/format"

interface Wilaya {
  id: string
  name: string
  code: string
  shipping_cost: number
  delivery_days: number
  is_active: boolean
}

interface WilayasPageContentProps {
  initialWilayas: Wilaya[]
}

export function WilayasPageContent({ initialWilayas }: WilayasPageContentProps) {
  const { toast } = useToast()
  const [wilayas, setWilayas] = useState(initialWilayas)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingWilaya, setEditingWilaya] = useState<Wilaya | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filteredWilayas = wilayas.filter((wilaya) =>
    wilaya.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wilaya.code.includes(searchQuery)
  )

  const handleEdit = (wilaya: Wilaya) => {
    setEditingWilaya(wilaya)
    setIsEditOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const shippingValue = formData.get("shipping") as string
    const daysValue = formData.get("days") as string
    
    if (!editingWilaya?.id) {
      console.error('No wilaya ID found')
      return
    }

    const data = {
      id: editingWilaya.id,
      code: editingWilaya.code,
      name: formData.get("name") as string,
      shipping_cost: shippingValue ? parseInt(shippingValue) : editingWilaya.shipping_cost,
      delivery_days: daysValue ? parseInt(daysValue) : editingWilaya.delivery_days,
      is_active: formData.get("active") === "on",
    }

    console.log('[handleSubmit] Data to send:', data)

    try {
      const response = await fetch("/api/admin/wilayas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update")
      }

      const updated = await response.json()
      
      setWilayas(prev => prev.map(w => w.id === updated.id ? updated : w))
      setIsEditOpen(false)
      setEditingWilaya(null)
      
      toast({
        title: "Success",
        description: "Wilaya updated successfully",
      })
    } catch (error) {
      console.error('[handleSubmit] Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update wilaya",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkUpdate = async (field: "shipping_cost" | "delivery_days" | "is_active", value: any) => {
    setIsLoading(true)
    try {
      const updates = wilayas.map(wilaya => ({
        ...wilaya,
        [field]: value,
      }))

      // Update all wilayas
      await Promise.all(
        updates.map(w =>
          fetch("/api/admin/wilayas", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(w),
          })
        )
      )

      setWilayas(updates)
      toast({
        title: "Success",
        description: `All wilayas updated`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wilayas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Wilayas & Shipping</h1>
          <p className="text-muted-foreground">Manage shipping costs for Algerian wilayas</p>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Wilaya - {editingWilaya?.code}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={editingWilaya?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping">Shipping Cost (DZD)</Label>
              <Input
                id="shipping"
                name="shipping"
                type="number"
                defaultValue={editingWilaya?.shipping_cost}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Delivery Days</Label>
              <Input
                id="days"
                name="days"
                type="number"
                defaultValue={editingWilaya?.delivery_days}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="active" name="active" defaultChecked={editingWilaya?.is_active} />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search wilayas..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Wilayas Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Wilaya</TableHead>
              <TableHead>Shipping Cost</TableHead>
              <TableHead>Delivery Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWilayas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No wilayas found</p>
                  <p className="text-sm text-muted-foreground">Add wilayas to manage shipping costs</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredWilayas.map((wilaya) => (
                <TableRow key={wilaya.id}>
                  <TableCell className="font-medium">{wilaya.code}</TableCell>
                  <TableCell>{wilaya.name}</TableCell>
                  <TableCell>{formatPrice(wilaya.shipping_cost)}</TableCell>
                  <TableCell>{wilaya.delivery_days} days</TableCell>
                  <TableCell>
                    {wilaya.is_active ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(wilaya)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Quick Actions */}
      {wilayas.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkUpdate("shipping_cost", 500)}
              disabled={isLoading}
            >
              Set All to 500 DZD
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkUpdate("delivery_days", 3)}
              disabled={isLoading}
            >
              Set All to 3 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkUpdate("is_active", true)}
              disabled={isLoading}
            >
              Enable All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

