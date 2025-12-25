import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface Produit {
  id: string;
  nom: string;
  description: string | null;
  category_id: number;
  prix: number;
  image_principale: string | null;
  image_secondaire: string | null;
  est_nouveau: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export type SortOption = 'created_at' | 'nom' | 'prix_asc' | 'prix_desc';

export interface ProductFilters {
  category_id?: number;
  minPrice?: number;
  maxPrice?: number;
  est_nouveau?: boolean;
}

export interface UseProductsOptions {
  sortBy?: SortOption;
  filters?: ProductFilters;
  enabled?: boolean;
}

export function useProducts(
  options: UseProductsOptions = {}
): UseQueryResult<Produit[], Error> {
  const { sortBy = 'created_at', filters = {}, enabled = true } = options;

  return useQuery({
    queryKey: ['products', sortBy, filters],
    queryFn: async () => {
      let query = supabase.from('produit').select('*');

      // Appliquer les filtres
      if (filters.category_id !== undefined) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('prix', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('prix', filters.maxPrice);
      }

      if (filters.est_nouveau !== undefined) {
        query = query.eq('est_nouveau', filters.est_nouveau);
      }

      // Appliquer le tri
      switch (sortBy) {
        case 'created_at':
          query = query.order('created_at', { ascending: false });
          break;
        case 'nom':
          query = query.order('nom', { ascending: true });
          break;
        case 'prix_asc':
          query = query.order('prix', { ascending: true });
          break;
        case 'prix_desc':
          query = query.order('prix', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      return (data || []) as Produit[];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
}

// Hook pour récupérer un seul produit par ID
export function useProduct(productId: string): UseQueryResult<Produit | null, Error> {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produit')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to fetch product: ${error.message}`);
      }

      return data as Produit;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
}

