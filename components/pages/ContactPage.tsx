"use client"
import { useState } from "react"
import { Page } from "@/types"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useSiteData } from '@/hooks/use-SiteData'
interface ContactPageProps {
  onNavigate: (page: Page) => void
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const { data: siteSettings } = useSiteData()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    console.log("Message sent:", formData)
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage="contact" onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-8 sm:mb-12">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#8B7355] mb-4 sm:mb-6">Trouvez-nous sur la carte</h2>
            <div className="bg-gray-100 rounded-lg overflow-hidden h-64 sm:h-96 flex items-center justify-center border border-gray-300">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.1234567890!2d-7.5898!3d33.5731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7d28fbc57c50d%3A0x123456789!2s123%20Design%20Street%2C%20Casablanca%2C%20Morocco!5e0!3m2!1sen!2s!4v1234567890"
              ></iframe>
            </div>

            <div className="mt-6 sm:mt-12">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Coordonnées</h3>
              <p className="text-gray-700 text-sm mb-4">{siteSettings?.address}</p>
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
              className="w-full bg-[#c3aa8c] hover:bg-[#b39977] text-white font-medium py-3 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
            >
              Envoyer le message
            </button>

            <div className="mt-8 space-y-3 text-sm">
              <p className="text-gray-600 text-sm">Écrivez-nous à <a href="mailto:contact@example.com" className="text-[#8B7355] hover:underline">contact@example.com</a></p>
              <p className="text-gray-700">
                <span className="font-medium">Téléphone:</span> {siteSettings?.phone}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {siteSettings?.email}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Heures d'ouverture:</span> {siteSettings?.opening_hours}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

