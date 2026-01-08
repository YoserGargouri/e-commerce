"use client"
import { useState } from "react"
import { Page } from "@/types"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useSiteData } from '@/hooks/use-SiteData'
import { toast } from "@/hooks/use-toast"

interface ContactPageProps {
  onNavigate: (page: Page) => void
}

// Fonction pour parser les coordonnées depuis un lien Google Maps
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

    // Format 3: Chercher dans l'URL complète
    const fullMatch = value.match(/[?&@](-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
    if (fullMatch) {
      const lat = Number.parseFloat(fullMatch[1])
      const lng = Number.parseFloat(fullMatch[2])
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { lat, lng }
      }
    }

    return null
  } catch {
    return null
  }
}

// Fonction pour convertir un lien Maps en URL embed
const toEmbedUrl = (raw: string) => {
  const value = raw.trim()
  if (!value) return null

  // Si c'est déjà un lien embed
  if (value.includes("/maps/embed") || value.includes("output=embed")) {
    return value
  }

  // Sinon, extraire les coordonnées et créer un embed
  const parsed = parseLatLngFromMapsLink(value)
  if (!parsed) return null

  return `https://maps.google.com/maps?q=${parsed.lat},${parsed.lng}&z=15&output=embed`
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const { data: siteSettings } = useSiteData()
  
  // Calculer l'URL embed à partir du lien stocké
  const computedEmbed = siteSettings?.google_maps_embed 
    ? toEmbedUrl(siteSettings.google_maps_embed)
    : (siteSettings?.latitude != null && siteSettings?.longitude != null
      ? `https://maps.google.com/maps?q=${siteSettings.latitude},${siteSettings.longitude}&z=15&output=embed`
      : null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/reclamations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.name,
          client_email: formData.email,
          sujet: formData.subject,
          message: formData.message,
        }),
      })

      const json = (await res.json().catch(() => null)) as { success?: boolean; error?: string } | null

      if (!res.ok) {
        throw new Error(json?.error || "Erreur lors de l'envoi du message.")
      }

      toast({
        title: "Succès",
        description: "Votre message a été envoyé.",
        variant: "success",
      })
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur lors de l'envoi du message.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="contact" onNavigate={onNavigate} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-8 sm:mb-12">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#8B7355] mb-4 sm:mb-6">Trouvez-nous sur la carte</h2>
              <div className="bg-gray-100 rounded-lg overflow-hidden h-64 sm:h-96 flex items-center justify-center border border-gray-300">
                {computedEmbed ? (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={computedEmbed}
                    title="Google Maps"
                  ></iframe>
                ) : (
                  <div className="p-4 text-sm text-gray-500 text-center">
                    La carte n'est pas encore configurée. Ajoutez un lien Google Maps dans les paramètres du site.
                  </div>
                )}
              </div>

              <div className="mt-6 sm:mt-12">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Coordonnées</h3>
                <p className="text-gray-700 text-sm mb-4">{siteSettings?.address}, {siteSettings?.city}</p>
                <p className="text-gray-700 text-sm">{siteSettings?.country}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#8B7355] mb-4 sm:mb-6">Contactez-nous</h2>

              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Nom</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Sujet</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tapez votre message ici..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                    rows={5}
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#c3aa8c] hover:bg-[#b39977] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
              >
                {isSubmitting ? "Envoi..." : "Envoyer le message"}
              </button>

              <div className="mt-8 space-y-3 text-sm">
                <p className="text-gray-600 text-sm">Écrivez-nous à <a href={`mailto:${siteSettings?.email || 'contact@example.com'}`} className="text-[#8B7355] hover:underline">{siteSettings?.email || 'contact@example.com'}</a></p>
                <p className="text-gray-700">
                  <span className="font-medium">Téléphone:</span> {siteSettings?.phone || 'Non renseigné'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span> {siteSettings?.email || 'Non renseigné'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Heures d'ouverture:</span> {siteSettings?.opening_hours || 'Non renseigné'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}