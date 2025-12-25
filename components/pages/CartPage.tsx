import Image from "next/image"
import { Trash2 } from "lucide-react"
import { Page, CartItem } from "@/types"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

interface CartPageProps {
  onNavigate: (page: Page) => void
  cartItems: CartItem[]
  onUpdateQuantity: (index: number, newQuantity: number) => void
  onRemoveItem: (index: number) => void
}

export function CartPage({ onNavigate, cartItems, onUpdateQuantity, onRemoveItem }: CartPageProps) {
  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number.parseFloat(item.price.replace(/\s*DTN\s*/gi, ""))
    const quantity = item.quantity || 1
    return sum + price * quantity
  }, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage="cart" onNavigate={onNavigate} cartItemsCount={cartItems.length} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Panier d'achat</h1>
            <p className="text-gray-600 mb-8">{cartItems.length} articles dans votre panier</p>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left font-bold text-gray-900 pb-4">Produit</th>
                    <th className="text-left font-bold text-gray-900 pb-4">Prix unitaire</th>
                    <th className="text-left font-bold text-gray-900 pb-4">Quantité</th>
                    <th className="text-left font-bold text-gray-900 pb-4">Total</th>
                    <th className="text-left font-bold text-gray-900 pb-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        Votre panier est vide
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((item, idx) => {
                      const unitPrice = Number.parseFloat(item.price.replace(/\s*DTN\s*/gi, ""))
                      const quantity = item.quantity || 1
                      const itemTotal = unitPrice * quantity
                      
                      return (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="py-4">
                            <div className="flex gap-3 items-center">
                              <div className="relative w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                                <Image
                                  src={item.image || "/images/background.png"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-600">{item.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-gray-900 font-medium">{item.price}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => onUpdateQuantity(idx, Math.max(1, quantity - 1))}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
                                aria-label="Diminuer la quantité"
                              >
                                −
                              </button>
                              <span className="text-gray-900 font-medium min-w-[2rem] text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(idx, quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
                                aria-label="Augmenter la quantité"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-4 text-gray-900 font-bold">
                            {itemTotal.toFixed(2)} DTN
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => onRemoveItem(idx)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              aria-label="Supprimer l'article"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => onNavigate("article")}
              className="px-6 py-3 border-2 border-gray-400 text-gray-900 font-medium rounded hover:bg-gray-50 transition-colors"
            >
Continuer mes achats
            </button>
          </div>

          <div className="w-80 flex-shrink-0">
            <div className="bg-stone-50 rounded-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Récapitulatif de la commande</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-700">Sous-total</span>
                  <span className="font-medium text-gray-900">{subtotal.toFixed(2)} DTN</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-700">Livraison</span>
                  <span className="font-medium text-green-600">Gratuite</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-700">TVA (10%)</span>
                  <span className="font-medium text-gray-900">{tax.toFixed(2)} DTN</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8 pt-4 border-t border-gray-300">
                <span className="font-bold text-gray-900 text-lg">Total TTC</span>
                <span className="font-bold text-gray-900 text-lg">{total.toFixed(2)} DTN</span>
              </div>

              <button
                onClick={() => onNavigate("checkout")}
                className="w-full bg-[#c3aa8c] hover:bg-[#b39977] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Procéder au paiement <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

