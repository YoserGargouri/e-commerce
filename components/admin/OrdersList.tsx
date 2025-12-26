"use client"
import React, { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Download, Trash2 } from "lucide-react"
import {
  useCommandes,
  useDeleteCommande,
  useUpdateCommandeStatus,
  formatStatutCommande,
  type Commande,
} from "@/hooks/use-Commandes"

export function OrdersList() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: commandes, isLoading, error } = useCommandes()
  const updateStatus = useUpdateCommandeStatus()
  const deleteCommande = useDeleteCommande()

  const orders: Commande[] = commandes || []

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return orders

    return orders.filter((o) => {
      return (
        (o.numero_commande || "").toLowerCase().includes(q) ||
        (o.client_name || "").toLowerCase().includes(q) ||
        (o.client_email || "").toLowerCase().includes(q) ||
        (o.client_phone || "").toLowerCase().includes(q) ||
        (o.client_city || "").toLowerCase().includes(q)
      )
    })
  }, [orders, searchQuery])

  const getItemsCount = (items: unknown): number => {
    if (!items) return 0
    if (Array.isArray(items)) return items.length
    if (typeof items === "object") {
      const values = Object.values(items as Record<string, unknown>)
      if (Array.isArray(values)) return values.length
    }
    return 0
  }

  const handleSetLivree = async (commandeId: string) => {
    try {
      await updateStatus.mutateAsync({ commandeId, statut_commande: "livree" })
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Erreur lors de la mise à jour du statut.")
    }
  }

  const handleSetEnAttente = async (commandeId: string) => {
    try {
      await updateStatus.mutateAsync({ commandeId, statut_commande: "en_attente" })
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Erreur lors de la mise à jour du statut.")
    }
  }

  const handleDeleteCommande = async (commande: Commande) => {
    if (commande.statut_commande === "livree") {
      return
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      return
    }

    try {
      await deleteCommande.mutateAsync(commande.id)
      alert("Commande supprimée avec succès.")
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Erreur lors de la suppression de la commande.")
    }
  }

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Date", "Client", "Email", "Téléphone", "Ville", "Total", "Statut"]
    const rows = orders.map((order) => [
      new Date(order.created_at || new Date().toISOString()).toLocaleDateString("fr-FR"),
      order.client_name,
      order.client_email,
      order.client_phone,
      order.client_city || "",
      `${order.total_commande.toFixed(2)} DTN`,
      formatStatutCommande(order.statut_commande),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des commandes...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error.message}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Commandes</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Gérer toutes les commandes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Liste des commandes</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {filteredOrders.length} commande{filteredOrders.length > 1 ? "s" : ""} au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher (client, email, téléphone, ville, n° commande...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xl"
            />
          </div>

          {filteredOrders.length === 0 ? (
         <div className="text-center py-8 text-gray-500">
              {searchQuery ? "Aucune commande trouvée" : "Aucune commande pour le moment"}
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="block md:hidden max-h-[70vh] overflow-y-auto pr-1 space-y-[14px]">
                {filteredOrders.map((order, index) => {
                  const isDelivered = order.statut_commande === "livree"
                  return (
                  <div
                    key={index}
                    className={`border border-gray-200 rounded-lg p-[14px] space-y-[10px] ${isDelivered ? "bg-gray-50 opacity-70" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-0.5">
                          {order.client_name}
                        </div>
                        <div className="text-xs text-gray-600 mb-1.5">
                          {new Date(order.created_at || new Date().toISOString()).toLocaleDateString("fr-FR")}
                        </div>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          <div>{order.client_email}</div>
                          <div>{order.client_phone}</div>
                          {order.client_city && <div>{order.client_city}</div>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="font-semibold text-sm">{order.total_commande.toFixed(2)} DTN</div>
                        <Badge variant="secondary" className="text-xs">
                          {getItemsCount(order.items)} article{getItemsCount(order.items) > 1 ? "s" : ""}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {formatStatutCommande(order.statut_commande)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-gray-200">
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetEnAttente(order.id)}
                        className="h-7 px-2 text-xs"
                        disabled={updateStatus.isPending || isDelivered}
                      >
                        En attente
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSetLivree(order.id)}
                        className="h-7 px-2 text-xs"
                        disabled={updateStatus.isPending || isDelivered}
                      >
                        Livré
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleDeleteCommande(order)
                        }}
                        className="h-7 w-7 p-0"
                        disabled={isDelivered || deleteCommande.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  )
                })}
              </div>

              {/* Desktop View - Table */}
              <div className="">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Date</TableHead>
                      <TableHead className="text-xs sm:text-sm">Client</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Email</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Téléphone</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Ville</TableHead>
                      <TableHead className="text-xs sm:text-sm">Articles</TableHead>
                      <TableHead className="text-xs sm:text-sm">Total</TableHead>
                      <TableHead className="text-xs sm:text-sm">Statut</TableHead>
                      <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order, index) => {
                      const isDelivered = order.statut_commande === "livree"
                      return (
                      <TableRow key={index} className={isDelivered ? "bg-gray-50 opacity-70" : undefined}>
                        <TableCell className="text-xs sm:text-sm">
                          {new Date(order.created_at || new Date().toISOString()).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {order.client_name}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{order.client_email}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">{order.client_phone}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{order.client_city}</TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="secondary" className="text-xs">
                            {getItemsCount(order.items)} article{getItemsCount(order.items) > 1 ? "s" : ""}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-xs sm:text-sm">
                          {order.total_commande.toFixed(2)} DTN
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <Badge variant="secondary" className="text-xs">
                            {formatStatutCommande(order.statut_commande)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 sm:gap-2">
                           
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetEnAttente(order.id)}
                              className="text-xs"
                              disabled={updateStatus.isPending || isDelivered}
                            >
                              En attente
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSetLivree(order.id)}
                              className="text-xs"
                              disabled={updateStatus.isPending || isDelivered}
                            >
                              Livré
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleDeleteCommande(order)
                              }}
                              className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2"
                              disabled={isDelivered || deleteCommande.isPending}
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

