import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Page, Product } from "@/types"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
// import { products } from "@/lib/data/products"
// import { storeConfig } from "@/config/store"
import { useSiteData} from '@/hooks/use-SiteData'
import { useProducts, type Produit } from '@/hooks/use-Product'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


interface HomePageProps {
  onNavigate: (page: Page) => void
  cartItemsCount: number
  onAddToCart?: (item: Product) => void
}

export function HomePage({ onNavigate, cartItemsCount, onAddToCart }: HomePageProps) {
  const { data: siteSettings } = useSiteData()
  const { data: products, isLoading: isLoadingProducts } = useProducts({
    sortBy: 'created_at',
  })
  
  // Convertir Produit en Product pour le panier
  const convertToProduct = (produit: Produit): Product => {
    return {
      id: parseInt(produit.id.replace(/-/g, '').substring(0, 10), 16) || 0,
      name: produit.nom,
      category: produit.category_id.toString(),
      price: `${produit.prix.toFixed(2)} DTN`,
      image: produit.image_principale || "/images/background.png",
    }
  }

  const handleAddToCart = (produit: Produit) => {
    if (onAddToCart) {
      onAddToCart(convertToProduct(produit))
    }
  }
  
  // Limiter à 8 produits pour le carousel
  const latestProducts = products?.slice(0, 8) || []
  
  return (
    <div className="min-h-screen bg-white">
      <Header currentPage="home" onNavigate={onNavigate} cartItemsCount={cartItemsCount} showSearch={false} showUser={false} />

      <section className="bg-gradient-to-b from-stone-200 to-stone-100">
        <div className="max-w-7xl mx-auto px-6 lg: flex items-stretch gap-8">
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-black leading-tight mb-4">
           {siteSettings?.site_name}
            </h1>
            <p className="text-base text-gray-800 mb-4 font-light">Collection haut de gamme de décoration intérieure</p>
            <p className="text-gray-700 text-sm leading-relaxed mb-6 max-w-md">
              {siteSettings?.site_description}
            </p>
            <button
              onClick={() => onNavigate("article")}
              className="inline-block px-8 py-3 bg-[#c3aa8c] hover:bg-[#b39977] text-white font-medium rounded text-sm w-fit"
            >
Découvrir la collection
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div
              className="relative w-full"
              style={{
                aspectRatio: "3 / 3.2",
                height: "90%",
                maxHeight: "90%",
              }}
            >
              <Image
                src={"/images/background.png"}
                alt="Modern interior with arched mirror"
                fill
                className="object-cover rounded-lg overflow-hidden"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Articles en avant */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500"></p>
            <h2 className="text-3xl font-bold text-gray-900"> Nos derniers articles</h2>
          </div>
          <button
            onClick={() => onNavigate("article")}
            className="px-4 py-2 text-sm font-medium text-white bg-[#c3aa8c] hover:bg-[#b39977] rounded"
          >
            Voir tout le catalogue
          </button>
        </div>
              
        {isLoadingProducts ? (
          // Skeleton loading
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
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
        ) : latestProducts.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {latestProducts.map((product) => (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                  <div className="bg-white rounded-lg overflow-hidden border border-gray-300 hover:shadow-lg transition-shadow">
                    <div 
                      className="relative aspect-square bg-gray-200 overflow-hidden cursor-pointer"
                      onClick={() => onNavigate("article")}
                    >
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
                      <h3 
                        className="text-sm font-medium text-gray-800 mb-1 line-clamp-2 cursor-pointer hover:text-[#c3aa8c] transition-colors"
                        onClick={() => onNavigate("article")}
                      >
                        {product.nom}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <p className="text-sm font-bold text-gray-800 mb-3">
                        {product.prix.toFixed(2)} DTN
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(product)
                        }}
                        className="w-full bg-[#c3aa8c] hover:bg-[#b39977] text-white py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <ShoppingCart size={16} />
                        Ajouter au panier
                      </button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 lg:-left-12" />
            <CarouselNext className="hidden md:flex -right-4 lg:-right-12" />
          </Carousel>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Aucun produit disponible pour le moment.
        </div>
        )}
      </section>

      <Footer />
    </div>
  )
}

