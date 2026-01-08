import { useSiteData } from '@/hooks/use-SiteData'

export function Footer() {
  const { data: siteSettings } = useSiteData()
  return (
    <footer className="mt-auto  bottom-0 bg-white border-t border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 mb-2">
          <div className="md:col-span-2">
            <p className="text-gray-700 text-xs leading-relaxed">
              Rehaussez votre espace grâce à notre collection sélectionnée avec soin d'objets décoratifs modernes et minimalistes.
            </p>
            <div className="flex gap-2 mt-1.5">
              <a href={siteSettings?.instagram_url || ""} className="text-black hover:text-gray-600" target="_blank" rel="noopener noreferrer">
                <img src="/icons/instagram_icon.png" alt="Instagram" className="w-10 h-10 sm:w-7 sm:h-7" />
              </a>
              <a href={siteSettings?.facebook_url || ""} className="text-black hover:text-gray-600" target="_blank" rel="noopener noreferrer">
                <img src="/icons/facebook_icon.png" alt="Facebook" className="w-10 h-10 sm:w-7 sm:h-7" />
              </a>
            </div>
            <div className="pt-2 text-xs text-gray-600 text-center sm:text-left">
              © 2025 {siteSettings?.site_name}. Tous droits réservés
            </div>
          </div>

          <div className="text-xs">
            <h3 className="font-bold text-black mb-1 sm:mb-1.5">Contactez-nous</h3>
            <div className="space-y-0.5 text-gray-700">
              <p className="break-words">📍 {siteSettings?.address}, {siteSettings?.city}, {siteSettings?.country}</p>
              <p>📞 {siteSettings?.phone}</p>
              <p className="break-words">📧 {siteSettings?.email}</p>
            </div>
          </div>
        </div>

        
      </div>
    </footer>
  )
}