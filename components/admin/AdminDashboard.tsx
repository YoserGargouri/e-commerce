"use client"
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, ShoppingBag, Clock } from "lucide-react"
import { useLastCommandes, useDashboardStats } from "@/hooks/use-Commandes"
import { useRouter } from "next/navigation"

export function AdminDashboard() {
  const router = useRouter()
  const { data: stats, isLoading: loadingStats } = useDashboardStats()
  const { data: lastCommandes, isLoading: loadingCommandes } = useLastCommandes(6)

  const statCards = [
    {
      title: "Total Produits",
      value: stats?.totalProduits || 0,
      icon: ShoppingBag,
      description: "Produits en catalogue",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Total Commandes",
      value: stats?.totalCommandes || 0,
      icon: Package,
      description: "Toutes les commandes",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Commandes Récentes",
      value: stats?.commandesRecent24h || 0,
      icon: TrendingUp,
      description: "Dernières 24h",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
  <div className="space-y-6">
    
  {/* Titre et Stats Grid sur la même ligne */}
  <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6">
    {/* Titre à gauche */}
    <div className="lg:w-1/3">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de bord</h1>
      <p className="text-sm sm:text-base text-gray-600 mt-2">Vue d'ensemble de votre boutique</p>
    </div>
    
    {/* Cartes à droite - sur la même ligne */}
    <div className="lg:w-2/3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-1.5 sm:p-2 rounded-lg`}>
                  <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      </div>
      </div>

      {/* Dernières commandes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">6 Dernières commandes</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Commandes récentes mises à jour en temps réel</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCommandes ? (
            <div className="flex items-center justify-center py-6">
              <div className="text-sm text-gray-500">Chargement des commandes...</div>
            </div>
          ) : !lastCommandes || lastCommandes.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Aucune commande pour le moment</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {lastCommandes.map((commande) => (
                <div
                  key={commande.id}
                  className="flex flex-col h-full p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/X/admin/orders?id=${commande.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      router.push(`/X/admin/orders?id=${commande.id}`)
                    }
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {commande.numero_commande}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">
                      {commande.client_name}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                    <span className="truncate">{commande.client_phone}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {commande.created_at
                        ? new Date(commande.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      {Array.isArray(commande.items) ? commande.items.length : 0} article(s)
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {commande.total_commande.toFixed(2)} €
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

