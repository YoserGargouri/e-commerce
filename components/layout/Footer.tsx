import { useSiteData } from '@/hooks/use-SiteData'

export function Footer() {
  const { data: siteSettings } = useSiteData()
  return (
    <footer className="bg-white border-t border-gray-300">
      <div className="max-w-7xl mx-auto px-2 py-4">
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div className="col-span-2">
            <p className="text-gray-700 text-sm">
            Rehaussez votre espace grâce à notre collection sélectionnée avec soin d'objets décoratifs modernes et minimalistes.
            </p>
            <div className="flex  mt-6">
              <a href={siteSettings?.instagram_url || ""} className="text-black hover:text-gray-600">
                <img src="icons\instagram_icon.png" alt="Instagram" className="w-12 h-12" />
              </a>
              <a href={siteSettings?.facebook_url || ""} className="text-black hover:text-gray-600">
                <img src="icons/facebook_icon.png" alt="Facebook" className="w-12 h-12" />
              </a>
            </div>
          </div>

          <div className="text-sm">
            <h3 className="font-bold text-black mb-3">Contactez-nous</h3>
            <div className="space-y-2 text-gray-700">
              <p>📍 {siteSettings?.address}</p>
              <p>📞 {siteSettings?.phone}</p>
              <p>📧 {siteSettings?.email}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-6 text-xs text-gray-600">
          © 2025 {siteSettings?.site_name}. Tous droits réservés
        </div>
      </div>
    </footer>
  )
}

