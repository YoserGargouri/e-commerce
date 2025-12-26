import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
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

export interface CategoryInsert {
  code: string;
  nom: string;
  description?: string | null;
  ordre?: number | null;
  est_actif?: boolean | null;
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
        throw new Error(`Échec de la récupération des catégories : ${error.message}`);
      }
      return (data || []) as ProductCategory[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CategoryInsert) => {
      const insertPayload: CategoryInsert = {
        ...payload,
        description: payload.description ?? null,
        ordre: payload.ordre ?? 0,
        est_actif: payload.est_actif ?? true,
      };

      const { data, error } = await supabase
        .from('product_categories')
        .insert([insertPayload])
        .select('*')
        .single();

      if (error) {
        throw new Error(`Échec de l'ajout de la catégorie : ${error.message}`);
      }

      return data as ProductCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_categories'] });
    },
  });
}
