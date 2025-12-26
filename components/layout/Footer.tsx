import { useSiteData } from '@/hooks/use-SiteData'

export function Footer() {
  const { data: siteSettings } = useSiteData()
  return (
    <footer className="bg-white border-t border-gray-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="md:col-span-2">
            <p className="text-gray-700 text-xs sm:text-sm">
              Rehaussez votre espace grâce à notre collection sélectionnée avec soin d'objets décoratifs modernes et minimalistes.
            </p>
            <div className="flex gap-4 mt-4 sm:mt-6">
              <a href={siteSettings?.instagram_url || ""} className="text-black hover:text-gray-600">
                <img src="icons\instagram_icon.png" alt="Instagram" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              </a>
              <a href={siteSettings?.facebook_url || ""} className="text-black hover:text-gray-600">
                <img src="icons/facebook_icon.png" alt="Facebook" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              </a>
            </div>
          </div>

          <div className="text-xs sm:text-sm">
            <h3 className="font-bold text-black mb-2 sm:mb-3">Contactez-nous</h3>
            <div className="space-y-1 sm:space-y-2 text-gray-700">
              <p className="break-words">📍 {siteSettings?.address}, {siteSettings?.city}, {siteSettings?.country}</p>
              <p>📞 {siteSettings?.phone}</p>
              <p className="break-words">📧 {siteSettings?.email}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4 sm:pt-6 text-xs text-gray-600 text-center sm:text-left">
          © 2025 {siteSettings?.site_name}. Tous droits réservés
        </div>
      </div>
    </footer>
  )
}

