"use client"
import { useState } from "react"
import Image from "next/image"
import { ShoppingCart, Menu, X } from "lucide-react"
import { Page } from "@/types"
import { useSiteData } from '@/hooks/use-SiteData'

interface HeaderProps {
  currentPage?: Page
  onNavigate: (page: Page) => void
  cartItemsCount?: number
  showSearch?: boolean
  showUser?: boolean
}

export function Header({
  currentPage,
  onNavigate,
  cartItemsCount = 0,
  showSearch = true,
  showUser = true,
}: HeaderProps) {
  const { data: siteSettings } = useSiteData()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const handleNavClick = (page: Page) => {
    onNavigate(page)
    setMobileMenuOpen(false)
  }
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-[0.8rem] flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-black"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
            {siteSettings?.logo_url ? (
              <Image
                src={siteSettings.logo_url}
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="w-full h-full rounded bg-gray-100" aria-hidden="true" />
            )}
          </div>
        </div>

        <nav className="hidden md:flex gap-6 lg:gap-8">
          <button
            onClick={() => onNavigate("home")}
            className={`text-sm font-medium ${
              currentPage === "home" ? "text-black font-semibold" : "text-gray-700 hover:text-black"
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => onNavigate("article")}
            className={`text-sm font-medium ${
              currentPage === "article" ? "text-black font-semibold" : "text-gray-700 hover:text-black"
            }`}
          >
            Boutique
          </button>
          <button
            onClick={() => onNavigate("about")}
            className={`text-sm font-medium ${
              currentPage === "about" ? "text-black font-semibold" : "text-gray-700 hover:text-black"
            }`}
          >
            À propos
          </button>
          <button
            onClick={() => onNavigate("contact")}
            className={`text-sm font-medium ${
              currentPage === "contact" ? "text-black font-semibold" : "text-gray-700 hover:text-black"
            }`}
          >
            Contact
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">

          <button onClick={() => handleNavClick("cart")} className="text-gray-700 hover:text-black relative p-2" aria-label="Panier">
            <ShoppingCart size={20} />
            {cartItemsCount > 0 && (
              <span className="absolute top-0 right-0 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-300 bg-white">
          <nav className="flex flex-col px-4 py-4 space-y-3">
            <button
              onClick={() => handleNavClick("home")}
              className={`text-left text-base font-medium py-2 ${
                currentPage === "home" ? "text-black font-semibold" : "text-gray-700"
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => handleNavClick("article")}
              className={`text-left text-base font-medium py-2 ${
                currentPage === "article" ? "text-black font-semibold" : "text-gray-700"
              }`}
            >
              Boutique
            </button>
            <button
              onClick={() => handleNavClick("about")}
              className={`text-left text-base font-medium py-2 ${
                currentPage === "about" ? "text-black font-semibold" : "text-gray-700"
              }`}
            >
              À propos
            </button>
            <button
              onClick={() => handleNavClick("contact")}
              className={`text-left text-base font-medium py-2 ${
                currentPage === "contact" ? "text-black font-semibold" : "text-gray-700"
              }`}
            >
              Contact
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}

