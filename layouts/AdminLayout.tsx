"use client"
import React, { ReactNode, useState, useEffect } from "react"
import Image from "next/image"
import { useAdminMode } from "@/hooks/useAdminMode"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, Settings, LogOut, Box, Menu, X } from "lucide-react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSiteData } from "@/hooks/use-SiteData"

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { exitAdminMode } = useAdminMode()
  const { logout } = useAuth()
  const { data: siteSettings } = useSiteData()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkDesktop = () => {
      const isDesktopView = window.innerWidth >= 1024
      // Sur desktop, sidebar toujours visible (pas besoin de state)
      // Sur mobile, sidebar masquée par défaut
      if (!isDesktopView) {
        setSidebarOpen(false)
      }
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const handleLogout = () => {
    logout()
    exitAdminMode()
    router.push("/")
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Produits", icon: Box },
    { href: "/admin/orders", label: "Commandes", icon: Package },
    { href: "/admin/settings", label: "Paramètres", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile menu button */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] sm:w-[300px] p-0">
                  <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </nav>
                </SheetContent>
              </Sheet>

              {siteSettings?.logo_url ? (
                <img
                  src={siteSettings.logo_url}
                  alt="Logo"
                  className="h-[5.5rem] w-[5.5rem] sm:h-[3.05rem] sm:w-[3.05rem] object-contain rounded bg-white"
                />
              ) : null}

              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Administration</h1>
              <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full whitespace-nowrap">
                MODE ADMIN
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
                <span className="sm:hidden">Déco</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Desktop Sidebar - toujours visible sur desktop */}
        <aside className="hidden lg:block w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200 min-h-[calc(100vh-73px)] relative z-10">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content with Background */}
        <main className="flex-1 relative min-h-[calc(100vh-73px)]">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <div className="relative w-full h-full">
              <Image
                src={"/images/background.png"}
                alt="Modern interior with arched mirror"
                fill
                className="object-cover opacity-50"
                priority
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 p-3 sm:p-4 lg:p-6 xl:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}