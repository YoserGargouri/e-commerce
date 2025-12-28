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
import { uploadProductImage, useProducts } from "@/hooks/use-Product"
import { useCategories } from "@/hooks/use_category"
import { supabase } from "@/lib/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@/hooks/use-toast"
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
  const [imagePrincipaleFile, setImagePrincipaleFile] = useState<File | null>(null)
  const [imageSecondaireFile, setImageSecondaireFile] = useState<File | null>(null)
  const [imagePrincipalePreview, setImagePrincipalePreview] = useState<string>("")
  const [imageSecondairePreview, setImageSecondairePreview] = useState<string>("")

  useEffect(() => {
    return () => {
      if (imagePrincipalePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePrincipalePreview)
      }
      if (imageSecondairePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imageSecondairePreview)
      }
    }
  }, [imagePrincipalePreview, imageSecondairePreview])

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
    setImagePrincipaleFile(null)
    setImageSecondaireFile(null)
    setImagePrincipalePreview("")
    setImageSecondairePreview("")
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
    setImagePrincipaleFile(null)
    setImageSecondaireFile(null)
    setImagePrincipalePreview(product.image_principale || "")
    setImageSecondairePreview(product.image_secondaire || "")
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
      toast({
        title: "Succès",
        description: "Produit supprimé avec succès.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du produit.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const productDataBase = {
        nom: formData.nom,
        description: formData.description || null,
        category_id: parseInt(formData.category_id),
        prix: parseFloat(formData.prix),
        est_nouveau: formData.est_nouveau,
      }

      if (editingProduct) {
        let imagePrincipaleUrl = formData.image_principale || null
        let imageSecondaireUrl = formData.image_secondaire || null

        if (imagePrincipaleFile) {
          imagePrincipaleUrl = await uploadProductImage(imagePrincipaleFile, {
            productId: String(editingProduct.id),
            type: "principale",
          })
        }

        if (imageSecondaireFile) {
          imageSecondaireUrl = await uploadProductImage(imageSecondaireFile, {
            productId: String(editingProduct.id),
            type: "secondaire",
          })
        }

        // Update existing product
        const { error } = await supabase
          .from("produit")
          .update({
            ...productDataBase,
            image_principale: imagePrincipaleUrl,
            image_secondaire: imageSecondaireUrl,
          })
          .eq("id", editingProduct.id)

        if (error) throw error
        toast({
          title: "Succès",
          description: "Produit modifié avec succès.",
          variant: "success",
        })
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("produit")
          .insert([
            {
              ...productDataBase,
              image_principale: null,
              image_secondaire: null,
            },
          ])
          .select("id")
          .single()

        if (insertError) throw insertError

        const insertedId = inserted?.id
        let imagePrincipaleUrl: string | null = null
        let imageSecondaireUrl: string | null = null

        if (insertedId && imagePrincipaleFile) {
          imagePrincipaleUrl = await uploadProductImage(imagePrincipaleFile, {
            productId: String(insertedId),
            type: "principale",
          })
        }

        if (insertedId && imageSecondaireFile) {
          imageSecondaireUrl = await uploadProductImage(imageSecondaireFile, {
            productId: String(insertedId),
            type: "secondaire",
          })
        }

        if (insertedId && (imagePrincipaleUrl || imageSecondaireUrl)) {
          const { error: updateImagesError } = await supabase
            .from("produit")
            .update({
              image_principale: imagePrincipaleUrl,
              image_secondaire: imageSecondaireUrl,
            })
            .eq("id", insertedId)

          if (updateImagesError) throw updateImagesError
        }

        toast({
          title: "Succès",
          description: "Produit ajouté avec succès.",
          variant: "success",
        })
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
      setImagePrincipaleFile(null)
      setImageSecondaireFile(null)
      setImagePrincipalePreview("")
      setImageSecondairePreview("")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement du produit.",
        variant: "destructive",
      })
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Gestion des Produits</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Gérer votre catalogue de produits</p>
        </div>
        <Button onClick={handleAddNew} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          <span className="text-xs sm:text-sm">Ajouter un produit</span>
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-[14px] sm:pt-6">
          <div className="relative">
            <Search className="absolute left-[10px] sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 text-sm sm:text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg">Liste des produits</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouvé{filteredProducts.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "Aucun produit trouvé" : "Aucun produit pour le moment"}
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="block md:hidden space-y-[14px]">
                {filteredProducts.map((product) => {
                  const category = categories?.find((cat) => cat.id === product.category_id)
                  return (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-[14px] space-y-[10px]">
                      <div className="flex items-start gap-[10px]">
                        {product.image_principale ? (
                          <img
                            src={product.image_principale}
                            alt={product.nom}
                            className="w-14 h-14 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                            Pas d'image
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-0.5">{product.nom}</div>
                          {product.description && (
                            <div className="text-xs text-gray-500 line-clamp-2 mb-1.5">
                              {product.description}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {category?.nom || `Catégorie ${product.category_id}`}
                            </Badge>
                            {product.est_nouveau && (
                              <Badge className="bg-green-100 text-green-700 text-xs">Nouveau</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-gray-200">
                        <div className="font-semibold text-sm">{product.prix.toFixed(2)} DTN</div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Image</TableHead>
                      <TableHead className="text-xs sm:text-sm">Nom</TableHead>
                      <TableHead className="text-xs sm:text-sm">Catégorie</TableHead>
                      <TableHead className="text-xs sm:text-sm">Prix</TableHead>
                      <TableHead className="text-xs sm:text-sm">Nouveau</TableHead>
                      <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const category = categories?.find((cat) => cat.id === product.category_id)
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="min-w-[80px]">
                            {product.image_principale ? (
                              <img
                                src={product.image_principale}
                                alt={product.nom}
                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                                Pas d'image
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="min-w-[150px]">
                            <div>
                              <div className="font-medium text-sm sm:text-base">{product.nom}</div>
                              {product.description && (
                                <div className="text-xs sm:text-sm text-gray-500 line-clamp-1">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[100px]">
                            <Badge variant="secondary" className="text-xs">
                              {category?.nom || `Catégorie ${product.category_id}`}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-sm sm:text-base min-w-[80px]">
                            {product.prix.toFixed(2)} DTN
                          </TableCell>
                          <TableCell className="min-w-[80px]">
                            {product.est_nouveau ? (
                              <Badge className="bg-green-100 text-green-700 text-xs">Nouveau</Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(product)}
                                className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2"
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                                className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:p-2"
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingProduct ? "Modifier le produit" : "Ajouter un nouveau produit"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Remplissez les informations du produit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom" className="text-sm">Nom du produit *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id" className="text-sm">Catégorie *</Label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
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
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prix" className="text-sm">Prix (DTN) *</Label>
                <Input
                  id="prix"
                  type="number"
                  step="0.01"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="est_nouveau" className="text-sm">Nouveau produit</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="est_nouveau"
                    checked={formData.est_nouveau}
                    onChange={(e) => setFormData({ ...formData, est_nouveau: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="est_nouveau" className="font-normal text-sm">
                    Marquer comme nouveau
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_principale" className="text-sm">Image principale</Label>
              <Input
                id="image_principale"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setImagePrincipaleFile(file)
                  if (file) {
                    const url = URL.createObjectURL(file)
                    setImagePrincipalePreview(url)
                    setFormData({ ...formData, image_principale: "" })
                  } else {
                    setImagePrincipalePreview(editingProduct?.image_principale || "")
                  }
                }}
                className="text-sm"
              />
              {imagePrincipalePreview ? (
                <div className="pt-2">
                  <img
                    src={imagePrincipalePreview}
                    alt="Aperçu image principale"
                    className="w-24 h-24 object-cover rounded border"
                  />
                </div>
              ) : null}
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

