"use client"
import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Download, Trash2 } from "lucide-react"

interface Order {
  orderDate: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  country: string
  items: Array<{
    name: string
    quantity: number
    price: string
  }>
  total: number
  status?: string
}

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders?action=list")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async (orderDate: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      return
    }

    try {
      const response = await fetch(`/api/orders?action=delete&orderId=${orderDate}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchOrders() // Refresh list
      }
    } catch (error) {
      console.error("Error deleting order:", error)
    }
  }

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Date", "Nom", "Email", "Téléphone", "Ville", "Total"]
    const rows = orders.map((order) => [
      new Date(order.orderDate).toLocaleDateString(),
      `${order.firstName} ${order.lastName}`,
      order.email,
      order.phone,
      order.city,
      `${order.total.toFixed(2)} DTN`,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des commandes...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-600 mt-2">
            Gérer toutes les commandes (chargées depuis le fichier orders.json)
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
          <CardDescription>
            {orders.length} commande{orders.length > 1 ? "s" : ""} au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune commande pour le moment
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Articles</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(order.orderDate).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        {order.firstName} {order.lastName}
                      </TableCell>
                      <TableCell>{order.email}</TableCell>
                      <TableCell>{order.phone}</TableCell>
                      <TableCell>{order.city}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {order.items.length} article{order.items.length > 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {order.total.toFixed(2)} DTN
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // View order details
                              alert(`Commande du ${new Date(order.orderDate).toLocaleDateString()}\nClient: ${order.firstName} ${order.lastName}\nTotal: ${order.total.toFixed(2)} DTN`)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.orderDate)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

