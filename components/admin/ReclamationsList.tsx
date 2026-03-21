"use client"
import React, { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"

type Reclamation = {
  id: number
  nom: string
  client_email: string
  sujet: string
  message: string
  date_creation: string | null
  date_modification: string | null
  is_read?: boolean | null
}

export function ReclamationsList() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Reclamation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selected, setSelected] = useState<Reclamation | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/reclamations", { method: "GET" })
      const json = (await res.json().catch(() => null)) as
        | { data: Reclamation[] }
        | { error: string }
        | null

      if (!res.ok) {
        const message = json && "error" in json ? json.error : "Erreur lors du chargement des réclamations."
        throw new Error(message)
      }

      if (!json || !("data" in json) || !Array.isArray(json.data)) {
        throw new Error("Réponse invalide du serveur.")
      }

      setItems(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du chargement des réclamations.")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return items

    return items.filter((r) => {
      return (
        (r.nom || "").toLowerCase().includes(q) ||
        (r.client_email || "").toLowerCase().includes(q) ||
        (r.sujet || "").toLowerCase().includes(q) ||
        (r.message || "").toLowerCase().includes(q)
      )
    })
  }, [items, searchQuery])

  const openDetails = (rec: Reclamation) => {
    setSelected(rec)
    setIsDetailsOpen(true)

    if (rec.is_read === false) {
      void fetch(`/api/admin/reclamations/${rec.id}/read`, { method: "PATCH" })
        .then(async (res) => {
          if (!res.ok) return
          setItems((prev) => prev.map((r) => (r.id === rec.id ? { ...r, is_read: true } : r)))
          window.dispatchEvent(new Event("reclamations:changed"))
        })
        .catch(() => {
          // ignore
        })
    }
  }

  const formatDate = (value: string | null) => {
    if (!value) return "-"
    const d = new Date(value)
    const t = d.getTime()
    if (!Number.isFinite(t)) return "-"
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDeleteSelected = async () => {
    if (!selected) return

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette réclamation ?")) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/reclamations/${selected.id}`, { method: "DELETE" })
      const json = (await res.json().catch(() => null)) as { success?: boolean; error?: string } | null

      if (!res.ok) {
        throw new Error(json?.error || "Erreur lors de la suppression de la réclamation.")
      }

      setItems((prev) => prev.filter((r) => r.id !== selected.id))
      setIsDetailsOpen(false)
      setSelected(null)
      window.dispatchEvent(new Event("reclamations:changed"))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la suppression de la réclamation.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Réclamations</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Messages envoyés par les clients</p>
      </div>

      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Liste des réclamations</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {filtered.length} réclamation{filtered.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher (nom, email, sujet, message...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xl"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="text-gray-500">Chargement des réclamations...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-10">
              <div className="text-red-600">{error}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Aucune réclamation</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm">Nom</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Email</TableHead>
                  <TableHead className="text-xs sm:text-sm">Sujet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    onClick={() => openDetails(r)}
                    className={`cursor-pointer ${r.is_read === false ? "bg-red-50" : ""}`}
                  >
                    <TableCell className="text-xs sm:text-sm">{formatDate(r.date_creation)}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{r.nom}</TableCell>
                    <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{r.client_email}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{r.sujet}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Détails de la réclamation</DialogTitle>
            <DialogDescription>Consulter le message du client</DialogDescription>
          </DialogHeader>

          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">Nom</div>
                  <div className="text-sm text-gray-700">{selected.nom}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Email</div>
                  <div className="text-sm text-gray-700">{selected.client_email}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-900">Sujet</div>
                <div className="text-sm text-gray-700">{selected.sujet}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-900">Message</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{selected.message}</div>
              </div>

              <div className="pt-2 text-xs text-gray-500">
                Créée le {formatDate(selected.date_creation)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Aucune réclamation sélectionnée.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
