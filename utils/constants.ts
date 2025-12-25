// Storage keys
export const STORAGE_KEYS = {
  CART: "ecommerce_cart_items",
  ADMIN_MODE: "ecommerce_admin_mode",
  USER_PREFERENCES: "ecommerce_user_preferences",
} as const

// Admin routes
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin",
  ORDERS: "/admin/orders",
  PRODUCTS: "/admin/products",
  SETTINGS: "/admin/settings",
} as const

// User routes
export const USER_ROUTES = {
  HOME: "/",
  PROFILE: "/profile",
  CART: "/cart",
  CHECKOUT: "/checkout",
} as const

// Public routes
export const PUBLIC_ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  ARTICLES: "/articles",
} as const

// Mode types
export type Mode = "user" | "admin"
export type Page = "home" | "article" | "cart" | "checkout" | "contact" | "about"

