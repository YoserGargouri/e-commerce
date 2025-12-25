"use client"
import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, DollarSign, TrendingUp, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/hooks/use-Product"

interface OrderStats {
  totalOrders: number
  totalRevenue: number
  recentOrders: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: 0,
  })
  const [loading, setLoading] = useState(true)
  const { data: products } = useProducts()

  useEffect(() => {
    // Fetch orders from API
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/orders?action=stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Produits",
      value: products?.length || 0,
      icon: ShoppingBag,
      description: "Produits en catalogue",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Total Commandes",
      value: stats.totalOrders,
      icon: Package,
      description: "Toutes les commandes",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    
    {
      title: "Commandes Récentes",
      value: stats.recentOrders,
      icon: TrendingUp,
      description: "Dernières 24h",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
  <div className="space-y-6">
    
  {/* Titre et Stats Grid sur la même ligne */}
  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
    {/* Titre à gauche */}
    <div className="lg:w-1/3">
      <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
      <p className="text-gray-600 mt-2">Vue d'ensemble de votre boutique</p>
    </div>
    
    {/* Cartes à droite - sur la même ligne */}
    <div className="lg:w-2/3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/products">
              <Button variant="outline">Gérer les produits</Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline">Voir toutes les commandes</Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline">Paramètres</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

