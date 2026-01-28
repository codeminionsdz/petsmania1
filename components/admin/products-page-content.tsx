"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Plus, MoreHorizontal, Edit2, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/format"
import type { Product, Category } from "@/lib/types"

export function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    Promise.all([fetch("/api/admin/products").then((r) => r.json()), fetch("/api/categories").then((r) => r.json())])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData.data || productsData || [])
        setCategories(categoriesData || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || product.categoryId === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Build flat category list for filter dropdown with hierarchy indication
  const categoryOptions: { id: string; name: string; isMain: boolean }[] = []
  categories.forEach((cat) => {
    categoryOptions.push({ id: cat.id, name: cat.name, isMain: true })
    if (cat.children) {
      cat.children.forEach((sub) => {
        categoryOptions.push({ id: sub.id, name: `  └ ${sub.name}`, isMain: false })
      })
    }
  })

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Rupture", variant: "destructive" as const }
    if (stock <= 10) return { label: "Stock bas", variant: "secondary" as const }
    return { label: "En stock", variant: "default" as const }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-muted-foreground">
            {products.length} produit{products.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des produits..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat.id} value={cat.id} className={cat.isMain ? "font-medium" : "text-muted-foreground"}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {products.length === 0 ? (
              <>
                <p>Aucun produit pour le moment.</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/products/new">Ajouter votre premier produit</Link>
                </Button>
              </>
            ) : (
              <p>Aucun produit ne correspond à votre recherche.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock)
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                          <Image
                            src={product.images?.[0] || "/placeholder.svg?height=48&width=48&query=product"}
                            alt={product.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.brandName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.categoryName || "-"}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/products/${product.slug}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/products/${product.id}`}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => {
                              if (!confirm(`Êtes-vous sûr de vouloir supprimer « ${product.name} » ?`)) return;
                              try {
                                const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
                                if (res.ok) {
                                  setProducts((prev) => prev.filter((p) => p.id !== product.id));
                                } else {
                                  const errorData = await res.json();
                                  console.error('Delete error:', errorData);
                                  alert(`Erreur lors de la suppression: ${errorData.error || 'Erreur inconnue'}`);
                                }
                              } catch (e) {
                                console.error('Network error:', e);
                                alert("Erreur réseau lors de la suppression.");
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
