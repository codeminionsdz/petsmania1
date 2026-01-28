"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit2, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { formatPrice, formatDate } from "@/lib/format"
import { Switch } from "@/components/ui/switch"

interface PromoCode {
  id: string
  code: string
  discount_type: string
  discount_value: number
  min_order_amount: number | null
  max_uses: number | null
  used_count: number
  valid_from: string
  valid_until: string
  is_active: boolean
}

interface PromoCodesPageContentProps {
  initialPromoCodes: PromoCode[]
}

interface FormData {
  id?: string
  code: string
  type: string
  value: number | string
  minOrder: number | string
  maxUses: number | string
  validFrom: string
  validUntil: string
  isActive: boolean
}

export function PromoCodesPageContent({ initialPromoCodes }: PromoCodesPageContentProps) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes)
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    code: "",
    type: "percentage",
    value: "",
    minOrder: "",
    maxUses: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
  })

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      minOrder: "",
      maxUses: "",
      validFrom: "",
      validUntil: "",
      isActive: true,
    })
    setIsEditMode(false)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsOpen(true)
  }

  const openEditDialog = (promo: PromoCode) => {
    setFormData({
      id: promo.id,
      code: promo.code,
      type: promo.discount_type,
      value: promo.discount_value,
      minOrder: promo.min_order_amount || "",
      maxUses: promo.max_uses || "",
      validFrom: promo.valid_from,
      validUntil: promo.valid_until,
      isActive: promo.is_active,
    })
    setIsEditMode(true)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = "/api/admin/promo-codes"
      const method = isEditMode ? "PATCH" : "POST"

      console.log("Submitting promo code:", formData)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)
      
      const responseText = await response.text()
      console.log("Response text:", responseText)
      
      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse response:", parseError)
        throw new Error("Invalid server response: " + responseText.substring(0, 100))
      }
      
      console.log("Parsed result:", result)
      
      if (!response.ok) {
        console.error("Server error:", result)
        const errorMessage = result.message || result.details || result.error || result.hint || "Failed to save promo code"
        throw new Error(errorMessage)
      }

      console.log("Saved promo code:", result)

      if (isEditMode) {
        setPromoCodes(promoCodes.map((p) => (p.id === result.id ? result : p)))
        toast({ title: "Success!", description: "Promo code updated successfully" })
      } else {
        setPromoCodes([result, ...promoCodes])
        toast({ title: "Success!", description: "Promo code created successfully" })
      }

      setIsOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving promo code:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save promo code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return

    try {
      const response = await fetch(`/api/admin/promo-codes?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      setPromoCodes(promoCodes.filter((p) => p.id !== id))
      toast({ title: "Success!", description: "Promo code deleted successfully" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete promo code",
        variant: "destructive",
      })
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: "Copied!", description: `Promo code ${code} copied to clipboard.` })
  }

  const filteredPromoCodes = promoCodes.filter((promo) =>
    promo.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Promo Codes</h1>
          <p className="text-muted-foreground">Create and manage discount codes</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit" : "Create"} Promo Code</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., SUMMER20"
                  className="uppercase"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Discount Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="e.g., 20"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrder">Min. Order (DZD)</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    placeholder="e.g., 5000"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : isEditMode ? "Update" : "Create"} Code
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search promo codes..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Promo Codes Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min. Order</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromoCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No promo codes found
                </TableCell>
              </TableRow>
            ) : (
              filteredPromoCodes.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="font-mono font-medium bg-secondary px-2 py-1 rounded">{promo.code}</code>
                      <button
                        onClick={() => copyCode(promo.code)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {promo.discount_type === "percentage"
                      ? `${promo.discount_value}%`
                      : formatPrice(promo.discount_value)}
                  </TableCell>
                  <TableCell>{promo.min_order_amount ? formatPrice(promo.min_order_amount) : "—"}</TableCell>
                  <TableCell>
                    {promo.used_count} / {promo.max_uses || "∞"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(promo.valid_until)}</TableCell>
                  <TableCell>
                    <Badge variant={promo.is_active ? "default" : "secondary"}>
                      {promo.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(promo)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(promo.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
