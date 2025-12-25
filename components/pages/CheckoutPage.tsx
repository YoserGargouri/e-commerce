"use client"
import { useState } from "react"
import { Page, CartItem } from "@/types"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

interface CheckoutPageProps {
  onNavigate: (page: Page) => void
  cartItems: CartItem[]
  onClearCart: () => void
}

export function CheckoutPage({ onNavigate, cartItems, onClearCart }: CheckoutPageProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Maroc",
    orderNotes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subtotal = cartItems.reduce((sum, item) => {
    const price = Number.parseFloat(item.price.replace(/\s*DTN\s*/gi, ""))
    const quantity = item.quantity || 1
    return sum + price * quantity
  }, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation basique
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.streetAddress || !formData.city) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (cartItems.length === 0) {
      alert("Votre panier est vide")
      return
    }

    setIsSubmitting(true)

    try {
      // Préparer les données de la commande
      const orderData = {
        ...formData,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image,
        })),
        subtotal,
        tax,
        total,
      }

      // Enregistrer la commande via l'API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'enregistrement")
      }

      // Vider le panier après la commande
      onClearCart()
      
      // Rediriger vers une page de confirmation ou home
      alert(`Commande passée avec succès !\nNuméro de commande: ${result.orderId}`)
      onNavigate("home")
    } catch (error) {
      console.error("Error submitting order:", error)
      alert(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la commande. Veuillez réessayer."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage="checkout" onNavigate={onNavigate} cartItemsCount={cartItems.length} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          <div className="flex-1">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations personnelles</h2>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Adresse email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Adresse de livraison</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">Adresse</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Ville</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Région/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>
              
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notes de commande (facultatif)</h2>
              <textarea
                name="orderNotes"
                value={formData.orderNotes}
                onChange={handleInputChange}
                placeholder="Des instructions spéciales pour la livraison, par exemple"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                rows={6}
              />
            </div>
          </div>

          <div className="w-80 flex-shrink-0">
            <div className="bg-stone-50 rounded-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Méthode de paiement</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-300">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Paiement à la livraison</p>
                      <p className="text-sm text-gray-600">Paiement en espèces à la livraison</p>
                    </div>
                    <p className="font-medium text-gray-900">{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} DTN</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Livraison</span>
                  <span className="text-green-600">Gratuite</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>TVA (10%)</span>
                  <span>{tax.toFixed(2)} DTN</span>
                </div>
              </div>

              <div className="flex justify-between text-base font-bold text-gray-900 pt-4 border-t border-gray-200">
                <span>Total TTC</span>
                <span>{total.toFixed(2)} DTN</span>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full bg-[#c3aa8c] hover:bg-[#b39977] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-4 rounded-lg transition-colors"
              >
                {isSubmitting ? "Traitement..." : "Passer la commande"}
              </button>

              <p className="text-xs text-center text-gray-600">
                En passant cette commande, vous acceptez nos{" "}
                <a href="#" className="underline hover:text-gray-900">
                  Conditions générales
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

