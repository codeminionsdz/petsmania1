'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search } from 'lucide-react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (query) {
      searchProducts()
    } else {
      setLoading(false)
    }
  }, [query])

  const searchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = `/api/search?q=${encodeURIComponent(query)}`
      console.log('[Search] Fetching from:', url)
      
      const response = await fetch(url)
      
      console.log('[Search] Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('[Search] API error:', errorData)
        throw new Error(errorData.error || 'Failed to search')
      }
      
      const data = await response.json()
      console.log('[Search] Results:', data)
      setResults(data.products || [])
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Une erreur s\'est produite lors de la recherche')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>

          <h1 className="text-4xl font-bold mb-2">Recherche</h1>
          <p className="text-muted-foreground">Trouvez vos produits favoris</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="lg">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Recherche en cours...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        ) : !query ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Entrez un terme de recherche pour commencer</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun produit trouvé pour "{query}"</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {product.image && (
                      <div className="w-full h-48 overflow-hidden bg-slate-100">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {product.short_description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.short_description}
                          </p>
                        )}
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-primary">
                            {(product.price / 100).toFixed(2)} DA
                          </span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {(product.original_price / 100).toFixed(2)} DA
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
