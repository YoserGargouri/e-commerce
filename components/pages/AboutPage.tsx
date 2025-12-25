import { Page } from "@/types"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useSiteData } from '@/hooks/use-SiteData'

interface AboutPageProps {
  onNavigate: (page: Page) => void
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const { data: siteSettings } = useSiteData()
  return (
    <div className="min-h-screen bg-white">
      <Header currentPage="about" onNavigate={onNavigate} />

      <section style={{ backgroundColor: "#c3aa8c" }} className="text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">À propos de nous</h1>
          <p className="text-xl font-light">{siteSettings?.site_name}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Notre Histoire</h2>

          <div className="bg-stone-50 rounded-lg p-12 border border-gray-200">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-base">
                {siteSettings?.historique}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

