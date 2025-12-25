import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { createClient } from '@/lib/supabase/server';

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

export function useSiteData(): UseQueryResult<SiteSettings | null, Error> {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) {
        // Gère le cas où aucun enregistrement n'existe
        if (error.code === 'PGRST116') {
          console.warn('No site settings found in database');
          return null;
        }
        throw new Error(`Failed to fetch site settings: ${error.message}`);
      }

      return data as SiteSettings;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - les paramètres du site changent rarement
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Réessaye seulement une fois en cas d'échec
  });
}