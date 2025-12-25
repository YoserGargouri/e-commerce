import Image from "next/image"
import { Search, User, ShoppingCart } from "lucide-react"
import { Page } from "@/types"
import { useSiteData } from '@/hooks/use-SiteData'
import { ModeToggle } from "@/components/common/ModeToggle"
import { useAdminMode } from "@/hooks/useAdminMode"
import Link from "next/link"
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
  const { isAdmin } = useAdminMode()
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-[0.8rem] flex items-center justify-between">
        <Image
          src={siteSettings?.logo_url || ""}
          alt="Logo Décoration Bourbiaa"
          width={100}
          height={100}
          priority
        />

        <nav className="hidden md:flex gap-8">
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
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <button onClick={() => onNavigate("cart")} className="text-gray-700 hover:text-black relative" aria-label="Panier">
            <ShoppingCart size={20} />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

