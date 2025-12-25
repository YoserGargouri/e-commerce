"use client"
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus } from "lucide-react"

export function UsersManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600 mt-2">Gérer les utilisateurs du système</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>Rechercher et gérer les utilisateurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="text-center py-8 text-gray-500">
            <p>Aucun utilisateur enregistré pour le moment</p>
            <p className="text-sm mt-2">
              Les  seront affichés ici une fois qu'ils auront créé un compte
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

