import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';

interface SiteSettings {
  id: string;
  site_name: string;
  site_title: string | null;
  site_description: string | null;
  logo_url: string | null;
  company_name: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  frais_livraison: number | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  google_maps_embed: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
  historique: string | null;
  updated_at: string | null;
  opening_hours: string | null;
}

export type SiteSettingsUpdate = Partial<Omit<SiteSettings, 'id' | 'created_at' | 'updated_at'>> & {
  id?: string;
};

export function useSiteData(): UseQueryResult<SiteSettings | null, Error> {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const res = await fetch('/api/site-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = (await res.json().catch(() => null)) as
        | { data: SiteSettings | null }
        | { error: string }
        | null;

      if (!res.ok) {
        const message = json && 'error' in json ? json.error : 'Erreur lors du chargement des paramètres du site.';
        throw new Error(message);
      }

      return json && 'data' in json ? (json.data as SiteSettings | null) : null;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - les paramètres du site changent rarement
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Réessaye seulement une fois en cas d'échec
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SiteSettingsUpdate) => {
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = (await res.json().catch(() => null)) as
        | { data: SiteSettings }
        | { error: string }
        | null;

      if (!res.ok) {
        const message = json && 'error' in json ? json.error : "Erreur lors de l'enregistrement des paramètres du site.";
        throw new Error(message);
      }

      if (!json || !('data' in json)) {
        throw new Error("Erreur lors de l'enregistrement des paramètres du site.");
      }

      return json.data as SiteSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
    },
  });
}