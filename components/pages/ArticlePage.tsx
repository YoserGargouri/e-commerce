"use client"
import { Search, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useState, useMemo } from "react"
import { Page, Product } from "@/types"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useProducts, type Produit, type SortOption } from '@/hooks/use-Product'
import { useCategories } from '@/hooks/use_category'

interface ArticlePageProps {
  onNavigate: (page: Page) => void
  onAddToCart: (item: Product) => void
  cartItemsCount?: number
}

const priceRanges = [
  { value: "all", label: "Tous les prix" },
  { value: "0-50", label: "0 - 50 DTN" },
  { value: "50-100", label: "50 - 100 DTN" },
  { value: "100-200", label: "100 - 200 DTN" },
  { value: "200+", label: "200+ DTN" },
]

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "created_at", label: "Plus récents" },
  { value: "nom", label: "Nom (A-Z)" },
  { value: "prix_asc", label: "Prix croissant" },
  { value: "prix_desc", label: "Prix décroissant" },
]

export function ArticlePage({ onNavigate, onAddToCart, cartItemsCount = 0 }: ArticlePageProps) {
  const [sortBy, setSortBy] = useState<SortOption>("created_at")
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined)
  const [selectedPriceRange, setSelectedPriceRange] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Récupérer les catégories
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  
  // Filtrer les catégories actives
  const activeCategories = useMemo(() => {
    return categories?.filter(cat => cat.est_actif !== false) || []
  }, [categories])

  // Calculer les filtres de prix
  const priceFilters = useMemo(() => {
    if (selectedPriceRange === "all") {
      return {}
    }
    
    if (selectedPriceRange.endsWith("+")) {
      const min = parseFloat(selectedPriceRange.replace("+", ""))
      return { minPrice: min }
    }
    
    const [min, max] = selectedPriceRange.split("-").map(Number)
    return { minPrice: min, maxPrice: max }
  }, [selectedPriceRange])

  // Récupérer les produits avec filtres
  const { data: products, isLoading: isLoadingProducts } = useProducts({
    sortBy,
    filters: {
      category_id: selectedCategory,
      ...priceFilters,
    },
  })

  // Convertir Produit en Product pour le panier
  const convertToProduct = (produit: Produit): Product => {
    const categoryName = activeCategories.find(cat => cat.id === produit.category_id)?.nom || produit.category_id.toString()
    return {
      id: parseInt(produit.id.replace(/-/g, '').substring(0, 10), 16) || 0,
      name: produit.nom,
      category: categoryName,
      price: `${produit.prix.toFixed(2)} DTN`,
      image: produit.image_principale || "/images/background.png",
    }
  }

  // Filtrer par recherche côté client
  const filteredProducts = useMemo(() => {
    if (!products) return []
    
    if (!searchQuery.trim()) {
      return products
    }

    const query = searchQuery.toLowerCase()
    return products.filter((product) => {
      const matchesName = product.nom.toLowerCase().includes(query)
      const matchesDescription = product.description?.toLowerCase().includes(query) || false
      const categoryName = activeCategories.find(cat => cat.id === product.category_id)?.nom.toLowerCase() || ""
      const matchesCategory = categoryName.includes(query)
      
      return matchesName || matchesDescription || matchesCategory
    })
  }, [products, searchQuery, activeCategories])

  const handleAddToCart = (produit: Produit) => {
    onAddToCart(convertToProduct(produit))
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <Header currentPage="article" onNavigate={onNavigate} cartItemsCount={cartItemsCount} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-300">
              <h3 className="font-bold text-gray-800 mb-4">Découvrez notre collection</h3>
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none hover:border-gray-400"
              >
                <option value="">Toutes les catégories</option>
                {isLoadingCategories ? (
                  <option disabled>Chargement...</option>
                ) : (
                  activeCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nom}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-300 mb-6">
              <h3 className="font-bold text-gray-800 mb-4">Tranche de prix</h3>
              <select 
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none hover:border-gray-400"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-300">
              <div className="text-sm text-gray-700 font-medium mb-4">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex gap-4 mb-8 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="w-full px-4 py-3 border-2 border-gray-800 rounded-lg text-sm focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-600 pointer-events-none" />
              </div>
            </div>

            {isLoadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-300 animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const categoryName = activeCategories.find(cat => cat.id === product.category_id)?.nom || ""
                  return (
                    <div key={product.id} className="bg-white rounded-lg overflow-hidden border border-gray-300 hover:shadow-lg transition-shadow">
                      <div className="relative aspect-square bg-gray-200 overflow-hidden">
                        <Image
                          src={product.image_principale || "/images/background.png"}
                          alt={product.nom}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                        {product.est_nouveau && (
                          <div className="absolute top-2 right-2 bg-[#c3aa8c] text-white text-xs px-2 py-1 rounded">
                            Nouveau
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">{product.nom}</p>
                        {categoryName && (
                          <p className="text-xs text-gray-600 mb-2">{categoryName}</p>
                        )}
                        {product.description && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                        )}
                        <p className="text-sm font-bold text-gray-800 mb-4">{product.prix.toFixed(2)} DTN</p>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-[#c3aa8c] hover:bg-[#b39977] text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <ShoppingCart size={16} />
                          Ajouter au panier
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-2">Aucun produit trouvé</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery ? "Essayez de modifier vos critères de recherche" : "Aucun produit disponible pour le moment"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
