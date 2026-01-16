"use client"

import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { STORAGE_KEYS } from "@/utils/constants"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useProduct } from "@/hooks/use-Product"
import { useCategories } from "@/hooks/use_category"

export default function ProductDetailsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const productId = params?.id ?? ""

  const [cartItemsCount, setCartItemsCount] = useState(0)

  const { data: product, isLoading, isError, error } = useProduct(productId)
  const { data: categories } = useCategories()

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CART)
      const current = stored ? (JSON.parse(stored) as unknown[]) : []
      setCartItemsCount(Array.isArray(current) ? current.length : 0)
    } catch {
      setCartItemsCount(0)
    }
  }, [])

  const normalizeImageSrc = (value: string) => {
    const v = value.trim().replace(/\\/g, "/")
    if (!v) return "/images/background.png"
    if (v.startsWith("data:")) return v
    if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/")) return v

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
    if (supabaseUrl) {
      if (v.startsWith("produits/")) {
        return `${supabaseUrl}/storage/v1/object/public/product-images/${v}`
      }
      if (v.startsWith("product-images/")) {
        return `${supabaseUrl}/storage/v1/object/public/${v}`
      }
      if (v.startsWith("storage/v1/object/public/")) {
        return `${supabaseUrl}/${v}`
      }
    }

    return `/${v}`
  }

  const splitImageField = (value: string | null | undefined): string[] => {
    if (!value) return []
    const raw = value.trim()
    if (!raw) return []

    // JSON array: ["url1", "url2"]
    if (raw.startsWith("[") && raw.endsWith("]")) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          return parsed
            .filter((v): v is string => typeof v === "string")
            .map((v) => v.trim())
            .filter(Boolean)
        }
      } catch {
        // fallthrough
      }
    }

    // CSV / multi-lines
    return raw
      .split(/[,;\n\r]+/)
      .map((v) => v.trim())
      .filter(Boolean)
  }

  const images = Array.from(
    new Set(
      [...splitImageField(product?.image_principale), ...splitImageField(product?.image_secondaire)]
        .map((v) => normalizeImageSrc(v))
        .filter(Boolean)
    )
  )

  const [brokenImages, setBrokenImages] = useState<Record<string, true>>({})

  const renderedImages = useMemo(() => {
    return images.map((src) => (brokenImages[src] ? "/images/background.png" : src))
  }, [images, brokenImages])
  const categoryName = categories?.find((c) => c.id === product?.category_id)?.nom

  const handleAddToCart = () => {
    if (!product) return

    const item = {
      id: Number(product.id),
      name: product.nom,
      category: categoryName || "",
      price: `${product.prix.toFixed(3)} DTN`,
      image: renderedImages[0] || "/images/background.png",
      quantity: 1,
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CART)
      const current = stored ? (JSON.parse(stored) as any[]) : []

      const existingIndex = current.findIndex(
        (cartItem) => cartItem?.id === item.id && cartItem?.name === item.name
      )

      if (existingIndex >= 0) {
        current[existingIndex] = {
          ...current[existingIndex],
          quantity: (current[existingIndex]?.quantity || 1) + 1,
        }
      } else {
        current.push(item)
      }

      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(current))

      // Mettre à jour le badge panier immédiatement
      setCartItemsCount(Array.isArray(current) ? current.length : 0)

      // Demander à la home d'ouvrir le panier (navigation cross-route)
      localStorage.setItem("ecommerce_last_page", "cart")
      router.push("/")
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 overflow-x-hidden flex flex-col">
      <Header
        currentPage={undefined}
        cartItemsCount={cartItemsCount}
        onNavigate={(page) => {
          try {
            localStorage.setItem("ecommerce_last_page", page)
          } catch {
            // ignore
          }
          router.push("/")
        }}
      />

      <main className="flex-1 w-full px-3 sm:px-6 py-4 sm:py-7">
        <div className="max-w-7xl mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-gray-700 hover:text-black mb-4"
          >
            Retour
          </button>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg border border-gray-300 aspect-[4/3] animate-pulse" />
              <div className="bg-white rounded-lg border border-gray-300 p-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ) : isError ? (
            <div className="bg-white rounded-lg border border-red-200 p-6 text-red-700">
              {error?.message || "Erreur lors du chargement du produit."}
            </div>
          ) : !product ? (
            <div className="bg-white rounded-lg border border-gray-300 p-6">Produit introuvable.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
              <div className="w-full">
                <div className="bg-white rounded-lg border border-gray-300 p-5 lg:p-6 h-full flex flex-col">
                  {renderedImages.length > 0 ? (
                    <Carousel opts={{ align: "start", loop: renderedImages.length > 1 }} className="w-full">
                      <CarouselContent className="-ml-0">
                        {renderedImages.map((src, idx) => (
                          <CarouselItem key={`${src}-${idx}`}>
                            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                              <Image
                                src={src}
                                alt={product.nom}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority={idx === 0}
                                onError={() => {
                                  const original = images[idx]
                                  console.log("[product] image load error:", original)
                                  setBrokenImages((prev) => ({ ...prev, [original]: true }))
                                }}
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {renderedImages.length > 1 && (
                        <>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </>
                      )}
                    </Carousel>
                  ) : (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src="/images/background.png"
                        alt={product.nom}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="mt-4 w-full bg-primary text-primary-foreground py-3 rounded-md hover:bg-[color:var(--primary-hover)] transition"
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>

              <div className="w-full">
                <div className="bg-white rounded-lg border border-gray-300 p-5 lg:p-6 h-full">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    {product.nom}
                  </h2>
                  {categoryName && (
                    <p className="text-base text-gray-600 mb-4 capitalize">Category : {categoryName}</p>
                  )}

                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    {product.prix.toFixed(3)} DTN
                  </h2>

                  {typeof product.stock === "number" && (
                    <div className="mb-4">
                      <p className={`text-base font-medium ${product.stock === 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                        Stock: {product.stock === 0 ? "Rupture de stock" : `${product.stock} disponible(s)`}
                      </p>
                    </div>
                  )}

                  {product.description && (
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <h2 className="text-lg font-bold text-gray-900 mb-2">Description</h2>
                      <p className="text-base text-gray-700 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Caractéristiques</h2>

                    {product.dimensions && (
                      <div className="flex items-start gap-3 py-1">
                        <span className="font-semibold text-gray-900 min-w-[120px]">Dimensions:</span>
                        <span className="text-gray-700">{product.dimensions}</span>
                      </div>
                    )}

                    {product.matiere && (
                      <div className="flex items-start gap-3 py-1">
                        <span className="font-semibold text-gray-900 min-w-[120px]">Matière:</span>
                        <span className="text-gray-700">{product.matiere}</span>
                      </div>
                    )}

                    {product.couleur && (
                      <div className="flex items-start gap-3 py-1">
                        <span className="font-semibold text-gray-900 min-w-[120px]">Couleur:</span>
                        <span className="text-gray-700">{product.couleur}</span>
                      </div>
                    )}

                    {typeof product.poids === "number" && (
                      <div className="flex items-start gap-3 py-1">
                        <span className="font-semibold text-gray-900 min-w-[120px]">Poids:</span>
                        <span className="text-gray-700">{product.poids} kg</span>
                      </div>
                    )}

                    {product.origine && (
                      <div className="flex items-start gap-3 py-1">
                        <span className="font-semibold text-gray-900 min-w-[120px]">Origine:</span>
                        <span className="text-gray-700">{product.origine}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}