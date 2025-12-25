"use client"
import React, { ReactNode } from "react"
import Image from "next/image"
import { useAdminMode } from "@/hooks/useAdminMode"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Package, Settings, LogOut, Box } from "lucide-react"
import Link from "next/link"

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { exitAdminMode } = useAdminMode()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    exitAdminMode()
    router.push("/admin/login")
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                MODE ADMIN
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Sidebar */}
        <aside className="w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200 min-h-[calc(100vh-73px)] relative z-10">
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
          <div className="relative z-10 p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}