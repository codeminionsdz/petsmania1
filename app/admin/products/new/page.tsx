"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ProductHierarchicalSelector, type ProductHierarchicalSelection } from "@/components/admin/product-hierarchical-selector"
import { SubcategoryDebugger } from "@/components/admin/subcategory-debugger"
import type { Category, Brand, Subcategory, AnimalType } from "@/lib/types"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Hierarchical selection state
  const [hierarchySelection, setHierarchySelection] = useState<ProductHierarchicalSelection>({
    animalId: "",
    categoryId: "",
    subcategoryId: "",
    brandId: "",
  })

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    price: "",
    originalPrice: "",
    discount: "",
    stock: "",
    shortDescription: "",
    description: "",
    tags: "",
    featured: false,
  })

  // Animals list for selector
  const ANIMALS = [
    { value: "cat", label: "Chats 🐱" },
    { value: "dog", label: "Chiens 🐕" },
    { value: "bird", label: "Oiseaux 🐦" },
    { value: "other", label: "Autres 🐾" },
  ] as const

  useEffect(() => {
    console.log("[NewProductPage] Loading data...")
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/subcategories").then((r) => r.json()),
      fetch("/api/admin/brands").then((r) => r.json()),
    ])
      .then(([categoriesData, subcategoriesData, brandsData]) => {
        console.log("[NewProductPage] ========== DATA LOADED ==========")
        console.log("[NewProductPage] Categories - count:", Array.isArray(categoriesData) ? categoriesData.length : "not array")
        console.log("[NewProductPage] Categories - sample:", categoriesData?.slice?.(0, 2))
        
        console.log("[NewProductPage] Subcategories - count:", Array.isArray(subcategoriesData) ? subcategoriesData.length : "not array")
        console.log("[NewProductPage] Subcategories - sample:", subcategoriesData?.slice?.(0, 5))
        
        console.log("[NewProductPage] Brands - count:", brandsData?.data?.length || brandsData?.length || 0)
        
        // Check for cat-specific subcategories
        const catSubs = subcategoriesData?.filter((sub: any) => sub.category_id?.includes?.('cat') || sub.name?.toLowerCase()?.includes?.('chat'))
        console.log("[NewProductPage] Cat-related subcategories:", catSubs)
        
        console.log("[NewProductPage] ============================\n")
        
        setCategories(categoriesData || [])
        setSubcategories(subcategoriesData || [])
        setBrands(brandsData.data || brandsData || [])
      })
      .catch((error) => {
        console.error("[NewProductPage] Error loading data:", error)
      })
  }, [])

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const baseSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/^-|-$/g, "")
      // Add a unique suffix to avoid duplicates
      const uniqueSlug = `${baseSlug}-${Date.now()}`
      setFormData((prev) => ({ ...prev, slug: uniqueSlug }))
    }
  }, [formData.name])

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height
          
          // Resize if too large
          const maxWidth = 1200
          const maxHeight = 1200
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = width * ratio
            height = height * ratio
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, { type: "image/jpeg" })
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            "image/jpeg",
            0.8
          )
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      toast({
        title: "Limite atteinte",
        description: "Vous pouvez télécharger un maximum de 5 images",
        variant: "destructive",
      })
      return
    }

    // Compress images
    const compressedFiles: File[] = []
    for (const file of files) {
      const compressed = await compressImage(file)
      compressedFiles.push(compressed)
    }

    setImages((prev) => [...prev, ...compressedFiles])
    
    // Create preview URLs
    compressedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert images to Data URLs or upload them
      const imageUrls: string[] = []
      for (const image of images) {
        try {
          const formData = new FormData()
          formData.append("file", image)
          
          const uploadRes = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          })
          
          if (!uploadRes.ok) {
            const errorData = await uploadRes.json()
            console.error("Upload error response:", errorData)
            throw new Error(errorData.error || "Échec du téléchargement de l'image")
          }
          
          const { url } = await uploadRes.json()
          imageUrls.push(url)
        } catch (imgError) {
          console.error("Individual image upload error:", imgError)
          throw imgError
        }
      }

      // Validate hierarchical selection
      if (!hierarchySelection.animalId) {
        throw new Error("Veuillez sélectionner un animal")
      }
      if (!hierarchySelection.categoryId) {
        throw new Error("Veuillez sélectionner une catégorie")
      }

      console.log("[NewProductPage] Hierarchy selection:", {
        animalId: hierarchySelection.animalId,
        categoryId: hierarchySelection.categoryId,
        subcategoryId: hierarchySelection.subcategoryId,
        brandId: hierarchySelection.brandId,
      })

      // Log subcategories for debugging
      console.log("[NewProductPage] All available subcategories:", subcategories)
      const selectedSubcategory = subcategories.find(s => s.id === hierarchySelection.subcategoryId)
      console.log("[NewProductPage] Selected subcategory details:", selectedSubcategory)

      // Create product with hierarchical data
      const productData = {
        name: formData.name,
        slug: formData.slug,
        sku: formData.sku || null,
        price: parseInt(formData.price),
        originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : null,
        discount: formData.discount ? parseInt(formData.discount) : null,
        stock: parseInt(formData.stock),
        animalId: hierarchySelection.animalId,
        categoryId: hierarchySelection.categoryId,
        subcategoryId: hierarchySelection.subcategoryId || null,
        brandId: hierarchySelection.brandId || null,
        shortDescription: formData.shortDescription || null,
        description: formData.description || null,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        featured: formData.featured,
        images: imageUrls.map((url, index) => ({
          url,
          position: index,
          alt: formData.name,
        })),
      }
      
      console.log("[NewProductPage] Full product data to be sent:", productData)

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      console.log("[NewProductPage] API response status:", res.status)

      if (!res.ok) {
        const error = await res.json()
        console.error("[NewProductPage] API error response:", error)
        throw new Error(error.error || "Échec de la création du produit")
      }

      const result = await res.json()
      console.log("[NewProductPage] Product created successfully:", result)

      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      })

      router.push("/admin/products")
      router.refresh()
    } catch (error) {
      console.error("Submit error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Ajouter un produit</h1>
          <p className="text-muted-foreground">Créer un nouveau produit</p>
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
                  <p className="text-xs text-muted-foreground">Généré automatiquement à partir du nom</p>
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
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square border rounded-lg overflow-hidden group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <label className="relative aspect-square border-2 border-dashed rounded-lg hover:border-primary hover:bg-accent cursor-pointer transition-colors flex flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Télécharger</span>
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
                  Téléchargez jusqu'à 5 images. La première image sera l'image principale.
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
                <CardTitle>Organisation du produit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProductHierarchicalSelector
                  animals={ANIMALS}
                  categories={categories}
                  subcategories={subcategories}
                  brands={brands}
                  onSelectionChange={setHierarchySelection}
                  loading={loading}
                />

                {/* Debug Info */}
                <div className="text-xs bg-amber-50 border border-amber-200 p-3 rounded">
                  <strong>Debug Info:</strong>
                  <div>Categories: {categories.length}</div>
                  <div>Subcategories: {subcategories.length}</div>
                  <div>Selected: Animal={hierarchySelection.animalId}, Category={hierarchySelection.categoryId}, SubCat={hierarchySelection.subcategoryId}</div>
                </div>

                <SubcategoryDebugger />

                <div className="space-y-2 pt-4 border-t">
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
            Créer le produit
          </Button>
        </div>
      </form>
    </div>
  )
}
