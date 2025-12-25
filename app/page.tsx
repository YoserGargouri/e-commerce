"use client"
import { useState, useEffect } from "react"
import type { Page } from "@/types"
import type { Product, CartItem } from "@/types"
import { HomePage } from "@/components/pages/HomePage"
import { ArticlePage } from "@/components/pages/ArticlePage"
import { CartPage } from "@/components/pages/CartPage"
import { CheckoutPage } from "@/components/pages/CheckoutPage"
import { ContactPage } from "@/components/pages/ContactPage"
import { AboutPage } from "@/components/pages/AboutPage"

const CART_STORAGE_KEY = "ecommerce_cart_items"

// Fonction pour charger le panier depuis localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as CartItem[]
    }
  } catch (error) {
    console.error("Error loading cart from storage:", error)
  }
  return []
}

// Fonction pour sauvegarder le panier dans localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window === "undefined") return
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error("Error saving cart to storage:", error)
  }
}

// Fonction pour vider le panier du cache
const clearCartFromStorage = () => {
  if (typeof window === "undefined") return
  
  try {
    localStorage.removeItem(CART_STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing cart from storage:", error)
  }
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const savedCart = loadCartFromStorage()
    if (savedCart.length > 0) {
      setCartItems(savedCart)
    }
  }, [])

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    if (cartItems.length > 0) {
      saveCartToStorage(cartItems)
    } else {
      // Si le panier est vide, on peut aussi vider le cache
      // ou le laisser pour permettre de revenir en arrière
      clearCartFromStorage()
    }
  }, [cartItems])

  const handleAddToCart = (item: Product) => {
    // Vérifier si l'article existe déjà dans le panier
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.id === item.id && cartItem.name === item.name
    )
    
    if (existingItemIndex >= 0) {
      // Si l'article existe, augmenter la quantité
      const updatedItems = [...cartItems]
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: (updatedItems[existingItemIndex].quantity || 1) + 1,
      }
      setCartItems(updatedItems)
    } else {
      // Sinon, ajouter un nouvel article
    setCartItems([...cartItems, { ...item, quantity: 1 }])
    }
          setCurrentPage("cart")
  }

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return
    
    const updatedItems = [...cartItems]
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity,
    }
    setCartItems(updatedItems)
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = cartItems.filter((_, i) => i !== index)
    setCartItems(updatedItems)
  }

  const handleClearCart = () => {
    setCartItems([])
    clearCartFromStorage()
  }

  const handleNavigate = (page: Page) => {
    setCurrentPage(page)
  }

  switch (currentPage) {
    case "article":
      return <ArticlePage onNavigate={handleNavigate} onAddToCart={handleAddToCart} cartItemsCount={cartItems.length} />
    case "cart":
      return (
        <CartPage
          onNavigate={handleNavigate}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
        />
      )
    case "checkout":
      return <CheckoutPage onNavigate={handleNavigate} cartItems={cartItems} onClearCart={handleClearCart} />
    case "contact":
      return <ContactPage onNavigate={handleNavigate} />
    case "about":
      return <AboutPage onNavigate={handleNavigate} />
    default:
      return <HomePage onNavigate={handleNavigate} cartItemsCount={cartItems.length} onAddToCart={handleAddToCart} />
  }
}
