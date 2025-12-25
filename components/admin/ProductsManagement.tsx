"use client"
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Edit, Trash2, X } from "lucide-react"
import { useProducts } from "@/hooks/use-Product"
import { useCategories } from "@/hooks/use_category"
import { supabase } from "@/lib/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import type { Produit } from "@/hooks/use-Product"

export function ProductsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Produit | null>(null)
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    category_id: "",
    prix: "",
    image_principale: "",
    image_secondaire: "",
    est_nouveau: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: products, isLoading } = useProducts()
  const { data: categories } = useCategories()
  const queryClient = useQueryClient()

  // Filter products by search query
  const filteredProducts = products?.filter((product) =>
    product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleAddNew = () => {
    setEditingProduct(null)
    setFormData({
      nom: "",
      description: "",
      category_id: "",
      prix: "",
      image_principale: "",
      image_secondaire: "",
      est_nouveau: false,
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (product: Produit) => {
    setEditingProduct(product)
    setFormData({
      nom: product.nom,
      description: product.description || "",
      category_id: product.category_id.toString(),
      prix: product.prix.toString(),
      image_principale: product.image_principale || "",
      image_secondaire: product.image_secondaire || "",
      est_nouveau: product.est_nouveau,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      return
    }

    try {
      const { error } = await supabase
        .from("produit")
        .delete()
        .eq("id", productId)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ["products"] })
      alert("Produit supprimé avec succès")
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Erreur lors de la suppression du produit")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const productData = {
        nom: formData.nom,
        description: formData.description || null,
        category_id: parseInt(formData.category_id),
        prix: parseFloat(formData.prix),
        image_principale: formData.image_principale || null,
        image_secondaire: formData.image_secondaire || null,
        est_nouveau: formData.est_nouveau,
      }

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from("produit")
          .update(productData)
          .eq("id", editingProduct.id)

        if (error) throw error
        alert("Produit modifié avec succès")
      } else {
        // Create new product
        const { error } = await supabase
          .from("produit")
          .insert([productData])

        if (error) throw error
        alert("Produit ajouté avec succès")
      }

      queryClient.invalidateQueries({ queryKey: ["products"] })
      setIsDialogOpen(false)
      setFormData({
        nom: "",
        description: "",
        category_id: "",
        prix: "",
        image_principale: "",
        image_secondaire: "",
        est_nouveau: false,
      })
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Erreur lors de l'enregistrement du produit")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des produits...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
          <p className="text-gray-600 mt-2">Gérer votre catalogue de produits</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un produit par nom ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des produits</CardTitle>
          <CardDescription>
            {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouvé{filteredProducts.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "Aucun produit trouvé" : "Aucun produit pour le moment"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Nouveau</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const category = categories?.find((cat) => cat.id === product.category_id)
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.image_principale ? (
                            <img
                              src={product.image_principale}
                              alt={product.nom}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                              Pas d'image
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.nom}</div>
                            {product.description && (
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {category?.nom || `Catégorie ${product.category_id}`}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {product.prix.toFixed(2)} DTN
                        </TableCell>
                        <TableCell>
                          {product.est_nouveau ? (
                            <Badge className="bg-green-100 text-green-700">Nouveau</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Modifier le produit" : "Ajouter un nouveau produit"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations du produit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du produit *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category_id">Catégorie *</Label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prix">Prix (DTN) *</Label>
                <Input
                  id="prix"
                  type="number"
                  step="0.01"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="est_nouveau">Nouveau produit</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="est_nouveau"
                    checked={formData.est_nouveau}
                    onChange={(e) => setFormData({ ...formData, est_nouveau: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="est_nouveau" className="font-normal">
                    Marquer comme nouveau
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_principale">URL Image principale</Label>
              <Input
                id="image_principale"
                type="url"
                value={formData.image_principale}
                onChange={(e) => setFormData({ ...formData, image_principale: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_secondaire">URL Image secondaire</Label>
              <Input
                id="image_secondaire"
                type="url"
                value={formData.image_secondaire}
                onChange={(e) => setFormData({ ...formData, image_secondaire: e.target.value })}
                placeholder="https://example.com/image2.jpg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Enregistrement..."
                  : editingProduct
                    ? "Modifier"
                    : "Ajouter"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

