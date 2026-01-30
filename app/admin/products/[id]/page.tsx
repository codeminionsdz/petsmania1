"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import type { Category, Brand } from "@/lib/types"

interface ProductImage {
  id: string
  url: string
  position: number
  alt: string | null
}

interface Product {
  id: string
  name: string
  slug: string
  sku: string | null
  price: number
  originalPrice: number | null
  discount: number | null
  stock: number
  categoryId: string
  brandId: string | null
  shortDescription: string | null
  description: string | null
  tags: string[] | null
  featured: boolean
  animalType?: string | null
  images: ProductImage[]
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [productId, setProductId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    price: "",
    originalPrice: "",
    discount: "",
    stock: "",
    categoryId: "",
    brandId: "",
    shortDescription: "",
    description: "",
    tags: "",
    featured: false,
    animalType: "",
  })

  // First, unwrap params
  useEffect(() => {
    params.then((resolvedParams) => {
      setProductId(resolvedParams.id)
    })
  }, [params])

  // Then fetch data when productId is available
  useEffect(() => {
    if (!productId) return

    Promise.all([
      fetch(`/api/admin/products/${productId}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/admin/brands").then((r) => r.json()),
    ])
      .then(([productData, categoriesData, brandsData]) => {
        setProduct(productData)
        setCategories(categoriesData || [])
        setBrands(brandsData.data || brandsData || [])
        
        // Populate form
        setFormData({
          name: productData.name,
          slug: productData.slug,
          sku: productData.sku || "",
          price: productData.price.toString(),
          originalPrice: productData.originalPrice?.toString() || "",
          discount: productData.discount?.toString() || "",
          stock: productData.stock.toString(),
          categoryId: productData.categoryId,
          brandId: productData.brandId || "",
          shortDescription: productData.shortDescription || "",
          description: productData.description || "",
          tags: productData.tags?.join(", ") || "",
          featured: productData.featured,
          animalType: productData.animalType || "",
        })
      })
      .catch(console.error)
      .finally(() => setFetching(false))
  }, [productId])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const currentImageCount = (product?.images.length || 0) - deletedImageIds.length + newImages.length
    
    if (files.length + currentImageCount > 5) {
      toast({
        title: "Limite atteinte",
        description: "Vous pouvez avoir un maximum de 5 images",
        variant: "destructive",
      })
      return
    }

    setNewImages((prev) => [...prev, ...files])
    
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeExistingImage = (imageId: string) => {
    setDeletedImageIds((prev) => [...prev, imageId])
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload new images
      const imageUrls: string[] = []
      for (const image of newImages) {
        const formData = new FormData()
        formData.append("file", image)
        
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        })
        
        if (!uploadRes.ok) throw new Error("Échec du téléchargement de l'image")
        
        const { url } = await uploadRes.json()
        imageUrls.push(url)
      }

      // Prepare existing images (not deleted)
      const existingImages = product?.images
        .filter((img) => !deletedImageIds.includes(img.id))
        .map((img) => ({
          id: img.id,
          url: img.url,
          position: img.position,
          alt: img.alt || formData.name,
        })) || []

      // Add new images
      const newImageObjects = imageUrls.map((url, index) => ({
        url,
        position: existingImages.length + index,
        alt: formData.name,
      }))

      // Update product
      const productData = {
        name: formData.name,
        slug: formData.slug,
        sku: formData.sku || null,
        price: parseInt(formData.price),
        originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : null,
        discount: formData.discount ? parseInt(formData.discount) : null,
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId,
        brandId: formData.brandId || null,
        shortDescription: formData.shortDescription || null,
        description: formData.description || null,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        featured: formData.featured,
        animalType: formData.animalType || null,
        images: [...existingImages, ...newImageObjects],
        deletedImageIds,
      }

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Échec de la mise à jour du produit")
      }

      toast({
        title: "Succès",
        description: "Produit mis à jour avec succès",
      })

      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Build flat category list
  const categoryOptions: { id: string; name: string }[] = []
  categories.forEach((cat) => {
    categoryOptions.push({ id: cat.id, name: cat.name })
    if (cat.children) {
      cat.children.forEach((sub) => {
        categoryOptions.push({ id: sub.id, name: `  └ ${sub.name}` })
      })
    }
  })

  if (fetching) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Produit non trouvé</p>
        <Button asChild className="mt-4">
          <Link href="/admin/products">Retour aux produits</Link>
        </Button>
      </div>
    )
  }

  const existingImages = product.images.filter((img) => !deletedImageIds.includes(img.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Modifier le produit</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Crème hydratante visage"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="creme-hydratante-visage"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Référence)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                    placeholder="PRD-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Description courte</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="Courte description du produit..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description complète</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Description détaillée du produit..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Images du produit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Existing images */}
                  {existingImages.map((image) => (
                    <div key={image.id} className="relative aspect-square border rounded-lg overflow-hidden group">
                      <img src={image.url} alt={image.alt || ""} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {/* New images */}
                  {newImagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative aspect-square border rounded-lg overflow-hidden group">
                      <img src={preview} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                        Nouveau
                      </div>
                    </div>
                  ))}
                  
                  {(existingImages.length + newImages.length) < 5 && (
                    <label className="relative aspect-square border-2 border-dashed rounded-lg hover:border-primary hover:bg-accent cursor-pointer transition-colors flex flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Ajouter</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum 5 images. La première image sera l'image principale.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prix et stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (DA) *</Label>
                  <Input
                    id="price"
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="2500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Prix original (DA)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))}
                    placeholder="3000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Réduction (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discount: e.target.value }))}
                    placeholder="20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                    placeholder="100"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Catégorie *</Label>
                  <Select
                    required
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandId">Marque</Label>
                  <Select
                    value={formData.brandId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, brandId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une marque" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animalType">Type d'animal</Label>
                  <Select
                    value={formData.animalType || "none"}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, animalType: value === "none" ? "" : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type d'animal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      <SelectItem value="cat">Chats</SelectItem>
                      <SelectItem value="dog">Chiens</SelectItem>
                      <SelectItem value="bird">Oiseaux</SelectItem>
                      <SelectItem value="other">Autres</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Optionnel - Cible ce produit pour un type d'animal</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="bio, naturel, vegan"
                  />
                  <p className="text-xs text-muted-foreground">Séparés par des virgules</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, featured: checked as boolean }))
                    }
                  />
                  <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
                    Produit en vedette
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Annuler</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Mettre à jour
          </Button>
        </div>
      </form>
    </div>
  )
}
