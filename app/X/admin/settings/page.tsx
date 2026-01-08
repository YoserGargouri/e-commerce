"use client"
import React, { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save } from "lucide-react"
import { useSiteData, useUpdateSiteSettings } from "@/hooks/use-SiteData"
import { toast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const { data: siteSettings, isLoading, error } = useSiteData()
  const updateSiteSettings = useUpdateSiteSettings()

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [mapsLocationLink, setMapsLocationLink] = useState<string>("")
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
      google_maps_embed: siteSettings.google_maps_embed || "",
      latitude: siteSettings.latitude == null ? "" : String(siteSettings.latitude),
      longitude: siteSettings.longitude == null ? "" : String(siteSettings.longitude),
      frais_livraison: siteSettings.frais_livraison == null ? "" : String(siteSettings.frais_livraison),
    })

    setLogoFile(null)
    setLogoPreview(siteSettings.logo_url || "")

    // Récupérer le lien Maps depuis la base de données
    if (siteSettings.google_maps_embed) {
      setMapsLocationLink(siteSettings.google_maps_embed)
    } else if (siteSettings.latitude != null && siteSettings.longitude != null) {
      setMapsLocationLink(`https://www.google.com/maps?q=${siteSettings.latitude},${siteSettings.longitude}`)
    } else {
      setMapsLocationLink("")
    }
  }, [siteSettings])

  const parseLatLngFromMapsLink = (raw: string) => {
    const value = raw.trim()
    if (!value) return null

    try {
      const url = new URL(value)

      // Format 1: ?q=lat,lng
      const q = url.searchParams.get("q")
      if (q) {
        const [latStr, lngStr] = q.split(",").map((s) => s.trim())
        const lat = Number.parseFloat(latStr)
        const lng = Number.parseFloat(lngStr)
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          return { lat, lng }
        }
      }

      // Format 2: /@lat,lng,zoom...
      const atMatch = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
      if (atMatch) {
        const lat = Number.parseFloat(atMatch[1])
        const lng = Number.parseFloat(atMatch[2])
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          return { lat, lng }
        }
      }

      // Format 3: /place/... puis chercher dans l'URL complète
      const fullMatch = value.match(/[?&@](-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
      if (fullMatch) {
        const lat = Number.parseFloat(fullMatch[1])
        const lng = Number.parseFloat(fullMatch[2])
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          return { lat, lng }
        }
      }
      return null
    } catch (e) {
      return null
    }
  }

  const toEmbedUrlFromMapsLink = (raw: string) => {
    const value = raw.trim()
    if (!value) return null

    // Si c'est déjà un lien embed, on le garde
    if (value.includes("/maps/embed") || value.includes("output=embed")) {
      return value
    }

    const parsed = parseLatLngFromMapsLink(value)
    if (!parsed) return null

    const embedUrl = `https://maps.google.com/maps?q=${parsed.lat},${parsed.lng}&z=15&output=embed`
    return embedUrl
  }

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview)
      }
    }
  }, [logoPreview])

  const uploadLogo = async (file: File) => {
    const form = new FormData()
    form.append("image", file)
    form.append("bucket", "site-assets")
    form.append("folder", "logos")
    form.append("type", "logo")

    const res = await fetch("/upload-simple", {
      method: "POST",
      body: form,
    })

    let payload: unknown = null
    try {
      payload = await res.json()
    } catch {
      // ignore
    }

    if (!res.ok) {
      const message =
        payload && typeof payload === "object" && payload && "error" in payload
          ? String((payload as any).error)
          : `Échec de l'upload du logo (HTTP ${res.status}).`
      throw new Error(message)
    }

    const url =
      payload && typeof payload === "object" && payload && "url" in payload
        ? String((payload as any).url)
        : ""

    if (!url) {
      throw new Error("Impossible de récupérer l'URL publique du logo.")
    }

    return url
  }

  const embedFromLink = toEmbedUrlFromMapsLink(mapsLocationLink)
  const parsedFromLink = parseLatLngFromMapsLink(mapsLocationLink)

  const computedMapsEmbed = embedFromLink
  const computedMapsLink = parsedFromLink
    ? `https://www.google.com/maps?q=${parsedFromLink.lat},${parsedFromLink.lng}`
    : "https://www.google.com/maps"

  const parsedFraisLivraison = form.frais_livraison.trim()
    ? Number.parseFloat(form.frais_livraison)
    : null
  const hasValidFraisLivraison =
    parsedFraisLivraison != null && !Number.isNaN(parsedFraisLivraison) && parsedFraisLivraison >= 0

  const handleSave = async () => {
    try {
      let logoUrlToSave = form.logo_url.trim() || null
      if (logoFile) {
        logoUrlToSave = await uploadLogo(logoFile)
      }

      let effectiveMapsLink = mapsLocationLink.trim()
      if (effectiveMapsLink) {
        try {
          const parsed = new URL(effectiveMapsLink)
          const isShortMaps =
            parsed.hostname === "maps.app.goo.gl" ||
            parsed.hostname.endsWith(".app.goo.gl") ||
            parsed.hostname === "goo.gl"

          if (isShortMaps) {
            const res = await fetch("/api/maps/resolve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: effectiveMapsLink }),
            })

            const json = (await res.json().catch(() => null)) as
              | { url: string }
              | { error: string }
              | null

            if (!res.ok) {
              const message = json && "error" in json ? json.error : "Impossible de résoudre le lien Google Maps."
              throw new Error(message)
            }

            if (json && "url" in json && typeof json.url === "string") {
              effectiveMapsLink = json.url
            }
          }
        } catch (e) {
          toast({
            title: "Lien Google Maps invalide",
            description: e instanceof Error ? e.message : "Lien Google Maps invalide.",
            variant: "destructive",
          })
          return
        }
      }

      const embedFromEffectiveLink = toEmbedUrlFromMapsLink(effectiveMapsLink)
      const parsedFromEffectiveLink = parseLatLngFromMapsLink(effectiveMapsLink)

      const hasMapsLink = Boolean(effectiveMapsLink)
      if (hasMapsLink && !embedFromEffectiveLink) {
        toast({
          title: "Lien Google Maps invalide",
          description:
            "Impossible de générer un lien embed à partir de ce lien. Utilisez un lien qui contient ?q=lat,lng ou /@lat,lng (ou un lien embed).",
          variant: "destructive",
        })
        return
      }

      const mapsEmbedToSave = embedFromEffectiveLink ?? null
      const latToSave = parsedFromEffectiveLink ? parsedFromEffectiveLink.lat : null
      const lngToSave = parsedFromEffectiveLink ? parsedFromEffectiveLink.lng : null

      const payload = {
        id: siteSettings?.id,
        site_name: form.site_name.trim() || undefined,
        site_title: form.site_title.trim() || null,
        site_description: form.site_description.trim() || null,
        logo_url: logoUrlToSave,
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
        google_maps_embed: mapsEmbedToSave,
        latitude: latToSave,
        longitude: lngToSave,
      }

      if (!payload.site_name) {
        toast({
          title: "Erreur",
          description: "Veuillez saisir le nom du site.",
          variant: "destructive",
        })
        return
      }

      await updateSiteSettings.mutateAsync(payload)

      if (mapsEmbedToSave) {
        setMapsLocationLink(mapsEmbedToSave)
      }

      if (logoFile && logoUrlToSave) {
        setForm((p) => ({ ...p, logo_url: logoUrlToSave || "" }))
        setLogoFile(null)
        setLogoPreview(logoUrlToSave)
      }

      toast({
        title: "Succès",
        description: "Paramètres enregistrés avec succès.",
        variant: "success",
      })
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur lors de l'enregistrement des paramètres.",
        variant: "destructive",
      })
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
                      <Label htmlFor="logo-file">Logo (upload)</Label>
                      <Input
                        id="logo-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setLogoFile(file)
                          if (file) {
                            const url = URL.createObjectURL(file)
                            setLogoPreview(url)
                          } else {
                            setLogoPreview(form.logo_url || "")
                          }
                        }}
                      />
                      {logoPreview ? (
                        <div className="pt-2">
                          <img
                            src={logoPreview}
                            alt="Aperçu du logo"
                            className="h-16 w-auto rounded border bg-white"
                          />
                        </div>
                      ) : null}
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
                      <div className="text-xs text-gray-500 mb-2">
                        Collez n'importe quel lien Google Maps ici (format court ou long)
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maps-location">Lien Google Maps</Label>
                        <Input
                          id="maps-location"
                          placeholder="Ex: https://maps.app.goo.gl/... ou https://www.google.com/maps/..."
                          value={mapsLocationLink}
                          onChange={(e) => {
                            const next = e.target.value
                            setMapsLocationLink(next)
                          }}
                          onBlur={() => {
                            if (!mapsLocationLink.trim()) return
                            const parsed = parseLatLngFromMapsLink(mapsLocationLink)
                            if (!parsed) {
                              toast({
                                title: "Lien invalide",
                                description: "Impossible d'extraire les coordonnées de ce lien. Essayez un autre format.",
                                variant: "destructive",
                              })
                            } else {
                              toast({
                                title: "Coordonnées détectées",
                                description: `Latitude: ${parsed.lat}, Longitude: ${parsed.lng}`,
                                variant: "success",
                              })
                            }
                          }}
                        />
                        <div className="text-xs text-gray-500">
                          Formats acceptés: liens courts (maps.app.goo.gl), liens avec ?q=, liens avec /@
                        </div>
                      </div>

                      <div className="border rounded-lg overflow-hidden mt-4">
                        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
                          <span className="text-sm font-medium text-gray-700">Aperçu de la carte</span>
                          <a
                            href={computedMapsLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm underline text-blue-600"
                          >
                            Ouvrir dans Google Maps
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
                          <div className="p-4 text-sm text-gray-500 text-center">
                            Collez un lien Google Maps pour afficher l'aperçu
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