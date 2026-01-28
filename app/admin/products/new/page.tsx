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

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  
  // Category hierarchy state
  const [mainCategoryId, setMainCategoryId] = useState("")
  const [subCategoryId, setSubCategoryId] = useState("")
  const [subcategories, setSubcategories] = useState<Category[]>([])
  
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
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/admin/brands").then((r) => r.json()),
    ])
      .then(([categoriesData, brandsData]) => {
        setCategories(categoriesData || [])
        setBrands(brandsData.data || brandsData || [])
      })
      .catch(console.error)
  }, [])

  // Update subcategories when main category changes
  useEffect(() => {
    if (mainCategoryId) {
      const mainCategory = categories.find((cat) => cat.id === mainCategoryId)
      if (mainCategory?.children) {
        setSubcategories(mainCategory.children)
        setSubCategoryId("")
        setFormData((prev) => ({ ...prev, categoryId: "" }))
      }
    } else {
      setSubcategories([])
      setSubCategoryId("")
      setFormData((prev) => ({ ...prev, categoryId: "" }))
    }
  }, [mainCategoryId, categories])

  // Update categoryId when subcategory is selected
  useEffect(() => {
    if (subCategoryId) {
      setFormData((prev) => ({ ...prev, categoryId: subCategoryId }))
    }
  }, [subCategoryId])

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
        .replace(/^-|-$/g, "")
      setFormData((prev) => ({ ...prev, slug }))
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

      // Validate category selection
      if (!formData.categoryId) {
        throw new Error("Veuillez sélectionner une catégorie")
      }

      // Create product
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
        images: imageUrls.map((url, index) => ({
          url,
          position: index,
          alt: formData.name,
        })),
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Échec de la création du produit")
      }

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

  // Build flat category list with hierarchy
  const mainCategories = categories.filter((cat) => !cat.parentId)

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
                <CardTitle>Organisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mainCategoryId">Catégorie principale *</Label>
                  <Select
                    required
                    value={mainCategoryId}
                    onValueChange={setMainCategoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subCategoryId">Catégorie secondaire *</Label>
                  <Select
                    required
                    value={subCategoryId}
                    onValueChange={setSubCategoryId}
                    disabled={!mainCategoryId || subcategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !mainCategoryId 
                          ? "Sélectionnez d'abord une catégorie" 
                          : subcategories.length === 0
                          ? "Pas de sous-catégories"
                          : "Sélectionner une sous-catégorie"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
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
