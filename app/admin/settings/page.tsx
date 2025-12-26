"use client"
import React, { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save } from "lucide-react"
import { useSiteData, useUpdateSiteSettings } from "@/hooks/use-SiteData"

export default function AdminSettingsPage() {
  const { data: siteSettings, isLoading, error } = useSiteData()
  const updateSiteSettings = useUpdateSiteSettings()

  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [form, setForm] = useState({
    site_name: "",
    site_title: "",
    site_description: "",
    logo_url: "",
    company_name: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
    phone: "",
    email: "",
    opening_hours: "",
    historique: "",
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
    google_maps_embed: "",
    latitude: "",
    longitude: "",
    frais_livraison: "",
  })

  useEffect(() => {
    if (!siteSettings) return

    setForm({
      site_name: siteSettings.site_name || "",
      site_title: siteSettings.site_title || "",
      site_description: siteSettings.site_description || "",
      logo_url: siteSettings.logo_url || "",
      company_name: siteSettings.company_name || "",
      address: siteSettings.address || "",
      city: siteSettings.city || "",
      postal_code: siteSettings.postal_code || "",
      country: siteSettings.country || "",
      phone: siteSettings.phone || "",
      email: siteSettings.email || "",
      opening_hours: siteSettings.opening_hours || "",
      historique: siteSettings.historique || "",
      facebook_url: siteSettings.facebook_url || "",
      instagram_url: siteSettings.instagram_url || "",
      tiktok_url: siteSettings.tiktok_url || "",
      google_maps_embed: siteSettings.google_maps_embed || "",
      latitude: siteSettings.latitude == null ? "" : String(siteSettings.latitude),
      longitude: siteSettings.longitude == null ? "" : String(siteSettings.longitude),
      frais_livraison:
        siteSettings.frais_livraison == null ? "" : String(siteSettings.frais_livraison),
    })
  }, [siteSettings])

  const parsedLatitude = form.latitude.trim() ? Number.parseFloat(form.latitude) : null
  const parsedLongitude = form.longitude.trim() ? Number.parseFloat(form.longitude) : null
  const hasValidCoordinates =
    parsedLatitude != null &&
    parsedLongitude != null &&
    !Number.isNaN(parsedLatitude) &&
    !Number.isNaN(parsedLongitude)

  const computedMapsEmbed = hasValidCoordinates
    ? `https://www.google.com/maps?q=${parsedLatitude},${parsedLongitude}&z=15&output=embed`
    : null

  const computedMapsLink = hasValidCoordinates
    ? `https://www.google.com/maps?q=${parsedLatitude},${parsedLongitude}`
    : "https://www.google.com/maps"

  const parsedFraisLivraison = form.frais_livraison.trim()
    ? Number.parseFloat(form.frais_livraison)
    : null
  const hasValidFraisLivraison =
    parsedFraisLivraison != null && !Number.isNaN(parsedFraisLivraison) && parsedFraisLivraison >= 0

  const handleSave = async () => {
    try {
      const payload = {
        id: siteSettings?.id,
        site_name: form.site_name.trim() || undefined,
        site_title: form.site_title.trim() || null,
        site_description: form.site_description.trim() || null,
        logo_url: form.logo_url.trim() || null,
        company_name: form.company_name.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        postal_code: form.postal_code.trim() || null,
        country: form.country.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        frais_livraison: hasValidFraisLivraison ? parsedFraisLivraison : 0,
        opening_hours: form.opening_hours.trim() || null,
        historique: form.historique.trim() || null,
        facebook_url: form.facebook_url.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        tiktok_url: form.tiktok_url.trim() || null,
        google_maps_embed: form.google_maps_embed.trim() || null,
        latitude: hasValidCoordinates ? parsedLatitude : null,
        longitude: hasValidCoordinates ? parsedLongitude : null,
      }

      if (!payload.site_name) {
        alert("Veuillez saisir le nom du site.")
        return
      }

      await updateSiteSettings.mutateAsync(payload)
      alert("Paramètres enregistrés avec succès.")
    } catch (e) {
      console.error(e)
      alert(e instanceof Error ? e.message : "Erreur lors de l'enregistrement des paramètres.")
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Gérer les paramètres de l'application</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-500">Chargement des paramètres...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-red-600">{error.message}</div>
          </div>
        ) : (
          <Tabs defaultValue="principal" className="w-full">
            <TabsList>
              <TabsTrigger value="principal">Info principal</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
            </TabsList>

            <TabsContent value="principal">
              <Card>
                <CardHeader>
                  <CardTitle>Info principal</CardTitle>
                  <CardDescription>Informations principales de la boutique</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="site-name">Nom du site</Label>
                      <Input
                        id="site-name"
                        placeholder="Décoration Bourbiaa"
                        value={form.site_name}
                        onChange={(e) => setForm((p) => ({ ...p, site_name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="site-title">Titre du site</Label>
                      <Input
                        id="site-title"
                        placeholder="Decoration Bourbiaa, Vente en ligne de décoration"
                        value={form.site_title}
                        onChange={(e) => setForm((p) => ({ ...p, site_title: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="site-description">Description du site</Label>
                      <Textarea
                        id="site-description"
                        rows={3}
                        placeholder="Boutique en ligne de décoration moderne et élégante"
                        value={form.site_description}
                        onChange={(e) => setForm((p) => ({ ...p, site_description: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="site-email">Email de contact</Label>
                      <Input
                        id="site-email"
                        type="email"
                        placeholder="contact@example.com"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="site-phone">Téléphone</Label>
                      <Input
                        id="site-phone"
                        type="tel"
                        placeholder="+216 XX XXX XXX"
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={form.address}
                        onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Pays</Label>
                      <Input
                        id="country"
                        value={form.country}
                        onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSave} disabled={updateSiteSettings.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      {updateSiteSettings.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Détails</CardTitle>
                  <CardDescription>Le reste des paramètres</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nom de l'entreprise</Label>
                      <Input
                        id="company-name"
                        placeholder="Decoration Bourbiaa"
                        value={form.company_name}
                        onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal-code">Code postal</Label>
                      <Input
                        id="postal-code"
                        value={form.postal_code}
                        onChange={(e) => setForm((p) => ({ ...p, postal_code: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="opening-hours">Horaires d'ouverture</Label>
                      <Input
                        id="opening-hours"
                        placeholder="Lun - Sam: 9h - 18h"
                        value={form.opening_hours}
                        onChange={(e) => setForm((p) => ({ ...p, opening_hours: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo-url">URL du logo</Label>
                      <Input
                        id="logo-url"
                        placeholder="https://..."
                        value={form.logo_url}
                        onChange={(e) => setForm((p) => ({ ...p, logo_url: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="historique">Historique</Label>
                      <Textarea
                        id="historique"
                        rows={4}
                        value={form.historique}
                        onChange={(e) => setForm((p) => ({ ...p, historique: e.target.value }))}
                      />
                    </div>

                    {/* Colonne pour les réseaux sociaux */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="instagram-url">Instagram</Label>
                        <Input
                          id="instagram-url"
                          placeholder="https://instagram.com/..."
                          value={form.instagram_url}
                          onChange={(e) => setForm((p) => ({ ...p, instagram_url: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facebook-url">Facebook</Label>
                        <Input
                          id="facebook-url"
                          placeholder="https://facebook.com/..."
                          value={form.facebook_url}
                          onChange={(e) => setForm((p) => ({ ...p, facebook_url: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frais-livraison">Frais de livraison</Label>
                      <Input
                        id="frais-livraison"
                        inputMode="decimal"
                        value={form.frais_livraison}
                        onChange={(e) => setForm((p) => ({ ...p, frais_livraison: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Google Maps</Label>
                      <div className="text-xs text-gray-500">
                        Astuce: recherchez votre adresse sur Google Maps, puis copiez les coordonnées
                        (latitude/longitude).
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
                          <span className="text-sm font-medium text-gray-700">Aperçu de la carte</span>
                          <a
                            href={computedMapsLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm underline"
                          >
                            Ouvrir Google Maps
                          </a>
                        </div>
                        {computedMapsEmbed ? (
                          <iframe
                            title="Carte Google Maps"
                            src={computedMapsEmbed}
                            className="w-full h-64"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        ) : (
                          <div className="p-4 text-sm text-gray-500">
                            Renseignez une latitude et une longitude valides pour afficher la carte.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSave} disabled={updateSiteSettings.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      {updateSiteSettings.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  )
}

