export interface Product {
  id: number
  name: string
  category: string
  price: string
  image: string
}

export interface CartItem extends Product {
  quantity?: number
}

export type Page = "home" | "article" | "cart" | "checkout" | "contact" | "about"

export type Mode = "user" | "admin"

export interface Order {
  orderDate: string
  firstName: string
  lastName: string
  email: string
  phone: string
  streetAddress: string
  city: string
  state: string
  zipCode: string
  country: string
  orderNotes: string
  items: Array<{
    id: number | string
    name: string
    category: string
    price: string
    quantity: number
    image?: string
  }>
  subtotal: number
  tax: number
  total: number
}

