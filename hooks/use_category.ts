import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface ProductCategory {
  id: number;
  code: string;
  nom: string;
  description: string | null;
  ordre: number | null;
  est_actif: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useCategories(): UseQueryResult<ProductCategory[], Error> {
  return useQuery({
    queryKey: ['product_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('ordre', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }
      return (data || []) as ProductCategory[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
}
