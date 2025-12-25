"use client"
import { AdminLayout } from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-2">Gérer les paramètres de l'application</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres généraux</CardTitle>
            <CardDescription>Configuration de base de la boutique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Nom du site</Label>
              <Input id="site-name" placeholder="Décoration Bourbiaa" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-email">Email de contact</Label>
              <Input id="site-email" type="email" placeholder="contact@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-phone">Téléphone</Label>
              <Input id="site-phone" type="tel" placeholder="+212 6XX XXX XXX" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mode maintenance</Label>
                <p className="text-sm text-gray-500">Mettre le site en maintenance</p>
              </div>
              <Switch />
            </div>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les modifications
            </Button>
          </CardContent>
        </Card>

       
      </div>
    </AdminLayout>
  )
}

