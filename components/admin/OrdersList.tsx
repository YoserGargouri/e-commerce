"use client"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Trash2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  useCommandes,
  useDeleteCommande,
  useUpdateCommandeStatus,
  formatStatutCommande,
  type Commande,
} from "@/hooks/use-Commandes"
import { useProducts, type Produit } from "@/hooks/use-Product"
import { toast } from "@/hooks/use-toast"

export function OrdersList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateSort, setDateSort] = useState<"desc" | "asc">("desc")
  const [statusFilter, setStatusFilter] = useState<"all" | "en_preparation" | "livree">("all")
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [highlightedCommandeId, setHighlightedCommandeId] = useState<string | null>(null)
  const { data: commandes, isLoading, error } = useCommandes()
  const { data: produits } = useProducts({ enabled: true })
  const updateStatus = useUpdateCommandeStatus()
  const deleteCommande = useDeleteCommande()
  const searchParams = useSearchParams()
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({})

  const orders: Commande[] = commandes || []

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    const matchSearch = (o: Commande) => {
      if (!q) return true
      return (
        (o.numero_commande || "").toLowerCase().includes(q) ||
        (o.client_name || "").toLowerCase().includes(q) ||
        (o.client_email || "").toLowerCase().includes(q) ||
        (o.client_phone || "").toLowerCase().includes(q) ||
        (o.client_city || "").toLowerCase().includes(q)
      )
    }

    const matchStatus = (o: Commande) => {
      if (statusFilter === "all") return true
      if (statusFilter === "livree") return o.statut_commande === "livree"
      return o.statut_commande !== "livree"
    }

    const toTs = (o: Commande) => {
      const d = o.created_at ? new Date(o.created_at) : new Date(0)
      const t = d.getTime()
      return Number.isFinite(t) ? t : 0
    }

    return [...orders]
      .filter((o) => matchSearch(o) && matchStatus(o))
      .sort((a, b) => {
        const diff = toTs(a) - toTs(b)
        return dateSort === "asc" ? diff : -diff
      })
  }, [orders, searchQuery, statusFilter, dateSort])

  const normalizedProductImageByName = useMemo(() => {
    const map = new Map<string, string>()
    const list: Produit[] = produits || []
    for (const p of list) {
      const key = (p.nom || "").trim().toLowerCase()
      if (!key) continue
      if (p.image_principale) {
        map.set(key, p.image_principale)
      }
    }
    return map
  }, [produits])

  const selectedCommandeItems = useMemo(() => {
    const raw = selectedCommande?.items
    if (!raw) return [] as Array<Record<string, unknown>>

    const tryParse = (value: unknown) => {
      if (typeof value !== "string") return value
      try {
        return JSON.parse(value) as unknown
      } catch {
        return value
      }
    }

    const parsed = tryParse(raw)

    if (Array.isArray(parsed)) return parsed as Array<Record<string, unknown>>

    if (parsed && typeof parsed === "object") {
      const maybeItems = (parsed as any).items
      if (Array.isArray(maybeItems)) return maybeItems as Array<Record<string, unknown>>

      const values = Object.values(parsed as Record<string, unknown>)
      if (values.every((v) => typeof v === "object" && v !== null)) {
        return values as Array<Record<string, unknown>>
      }
    }

    return [] as Array<Record<string, unknown>>
  }, [selectedCommande])

  const openDetails = (commande: Commande) => {
    setSelectedCommande(commande)
    setIsDetailsOpen(true)
  }

  useEffect(() => {
    const id = searchParams.get("id")
    if (!id) return

    const cmd = orders.find((o) => o.id === id)
    if (!cmd) return

    setHighlightedCommandeId(id)
    openDetails(cmd)

    window.setTimeout(() => {
      const el = rowRefs.current[id]
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 0)

    const t = window.setTimeout(() => {
      setHighlightedCommandeId(null)
    }, 4000)

    return () => window.clearTimeout(t)
  }, [orders, searchParams])

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

      toast({
        title: "Succès",
        description: "Commande marquée comme livrée.",
        variant: "success",
      })
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur lors de la mise à jour du statut.",
        variant: "destructive",
      })
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
      toast({
        title: "Succès",
        description: "Commande supprimée avec succès.",
        variant: "success",
      })
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur lors de la suppression de la commande.",
        variant: "destructive",
      })
    }
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
          <div className="mb-4 flex flex-col lg:flex-row lg:items-center gap-3">
            <Input
              placeholder="Rechercher (client, email, téléphone, ville, n° commande...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xl"
            />

            <div className="flex items-center gap-2 lg:ml-auto">
              <select
                value={dateSort}
                onChange={(e) => setDateSort(e.target.value as "asc" | "desc")}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="desc">Date: Récent → Ancien</option>
                <option value="asc">Date: Ancien → Récent</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "en_preparation" | "livree")}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">Statut: Tous</option>
                <option value="en_preparation">Statut: En préparation</option>
                <option value="livree">Statut: Livré</option>
              </select>
            </div>
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
                  const isHighlighted = highlightedCommandeId === order.id
                  return (
                    <div
                      key={index}
                      className={`border border-gray-200 rounded-lg p-[14px] space-y-[10px] ${isDelivered ? "bg-gray-50 opacity-70" : ""} ${isHighlighted ? "ring-2 ring-primary" : ""}`}
                      onClick={() => openDetails(order)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          openDetails(order)
                        }
                      }}
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
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSetLivree(order.id)
                          }}
                          className="h-7 px-2 text-xs"
                          disabled={updateStatus.isPending || isDelivered}
                        >
                          Livré
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
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
              <div className="hidden md:block">
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
                    {filteredOrders.map((order) => {
                      const isDelivered = order.statut_commande === "livree"
                      const isHighlighted = highlightedCommandeId === order.id
                      return (
                        <TableRow
                          key={order.id}
                          ref={(el) => {
                            rowRefs.current[order.id] = el
                          }}
                          className={`${isDelivered ? "bg-gray-50 opacity-70" : ""} ${isHighlighted ? "ring-2 ring-primary" : ""}`}
                          onClick={() => openDetails(order)}
                        >
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
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSetLivree(order.id)
                                }}
                                className="text-xs"
                                disabled={updateStatus.isPending || isDelivered}
                              >
                                Livré
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
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

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>
              {selectedCommande?.numero_commande ? `Commande: ${selectedCommande.numero_commande}` : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedCommande ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Client</div>
                  <div className="text-sm text-gray-700">{selectedCommande.client_name}</div>
                  <div className="text-sm text-gray-700">{selectedCommande.client_email}</div>
                  <div className="text-sm text-gray-700">{selectedCommande.client_phone}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-900">Adresse</div>
                  <div className="text-sm text-gray-700">{selectedCommande.client_address}</div>
                  <div className="text-sm text-gray-700">
                    {[selectedCommande.client_city, selectedCommande.client_zipcode, selectedCommande.client_country]
                      .filter(Boolean)
                      .join(" ")}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {formatStatutCommande(selectedCommande.statut_commande)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {getItemsCount(selectedCommande.items)} article{getItemsCount(selectedCommande.items) > 1 ? "s" : ""}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Total: {selectedCommande.total_commande.toFixed(2)} DTN
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">Articles commandés</div>
                {selectedCommandeItems.length === 0 ? (
                  <div className="text-sm text-gray-500">Aucun article trouvé.</div>
                ) : (
                  <div className="border rounded-lg divide-y">
                    {selectedCommandeItems.map((item, idx) => {
                      const rawName =
                        (item as any)?.name ??
                        (item as any)?.nom ??
                        (item as any)?.title ??
                        (item as any)?.product_name ??
                        (item as any)?.produit_name ??
                        (item as any)?.produit ??
                        (item as any)?.product?.name ??
                        (item as any)?.produit?.nom
                      const name = rawName && String(rawName).trim() ? String(rawName) : `Article ${idx + 1}`
                      const normalizedName = String(name).trim().toLowerCase()
                      const imageUrl = normalizedProductImageByName.get(normalizedName) || null
                      const quantity = (item as any)?.quantity ?? (item as any)?.quantite ?? 1
                      const price =
                        (item as any)?.prix_unitaire ??
                        (item as any)?.price ??
                        (item as any)?.prix ??
                        null
                      const lineTotal = (item as any)?.sous_total ?? (item as any)?.line_total ?? null
                      return (
                        <div key={idx} className="p-3 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={String(name)}
                                className="w-12 h-12 rounded-md object-cover border"
                                loading="lazy"
                              />
                            ) : null}

                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{String(name)}</div>
                              <div className="text-xs text-gray-600">Qté: {String(quantity)}</div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {lineTotal != null
                              ? `${Number(lineTotal).toFixed(2)} DTN`
                              : price != null
                                ? `${Number(price).toFixed(2)} DTN`
                                : ""}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Aucune commande sélectionnée.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}