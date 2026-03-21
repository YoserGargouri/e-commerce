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
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="about" onNavigate={onNavigate} />

      <main className="flex-1">
        <section style={{ backgroundColor: "#c3aa8c" }} className="text-white py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">À propos de nous</h1>
            <p className="text-lg sm:text-xl font-light">{siteSettings?.site_name}</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-3 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 lg:mb-12">Notre Histoire</h2>

            <div className="bg-stone-50 rounded-lg p-6 sm:p-8 lg:p-12 border border-gray-200">
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-base">
                  {siteSettings?.historique}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

