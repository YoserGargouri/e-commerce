import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface Produit {
  id: string;
  nom: string;
  description: string | null;
  category_id: number;
  prix: number;
  stock?: number | null;
  image_principale: string | null;
  image_secondaire: string | null;
  est_nouveau: boolean;
  dimensions?: string | null;
  matiere?: string | null;
  couleur?: string | null;
  poids?: number | null;
  origine?: string | null;
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

export interface ProduitInsert {
  nom: string;
  description?: string | null;
  category_id: number;
  prix: number;
  stock?: number | null;
  image_principale?: string | null;
  image_secondaire?: string | null;
  est_nouveau: boolean;
  dimensions?: string | null;
  matiere?: string | null;
  couleur?: string | null;
  poids?: number | null;
  origine?: string | null;
}

export interface ProduitUpdate {
  nom?: string;
  description?: string | null;
  category_id?: number;
  prix?: number;
  stock?: number | null;
  image_principale?: string | null;
  image_secondaire?: string | null;
  est_nouveau?: boolean;
  dimensions?: string | null;
  matiere?: string | null;
  couleur?: string | null;
  poids?: number | null;
  origine?: string | null;
  updated_at?: string;
}

export type ProductImageType = 'principale' | 'secondaire';

export async function uploadProductImage(
  file: File,
  options: {
    bucket?: string;
    folder?: string;
    productId?: string;
    type?: ProductImageType;
  } = {}
): Promise<string> {
  const { bucket = 'product-images', folder = 'produits', productId, type } = options;

  if (!file) {
    throw new Error('Aucun fichier sélectionné.')
  }

  // Upload via endpoint serveur pour éviter les problèmes de policies Storage côté navigateur.
  const form = new FormData()
  form.append('image', file)
  form.append('bucket', bucket)
  form.append('folder', folder)
  if (productId) form.append('productId', productId)
  if (type) form.append('type', type)

  const res = await fetch('/upload-simple', {
    method: 'POST',
    body: form,
  })

  let payload: unknown = null
  try {
    payload = await res.json()
  } catch {
    // ignore
  }

  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as any).error)
        : `Échec de l'envoi de l'image (HTTP ${res.status}).`
    throw new Error(message)
  }

  const url =
    payload && typeof payload === 'object' && 'url' in payload ? String((payload as any).url) : ''
  if (!url) {
    throw new Error("Impossible de récupérer l'URL publique de l'image.")
  }

  return url
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
        throw new Error(`Échec de la récupération des produits : ${error.message}`);
      }

      return (data || []) as Produit[];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
}

export function useCreateProduit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProduitInsert) => {
      const { data, error } = await supabase
        .from('produit')
        .insert([payload])
        .select('*')
        .single();

      if (error) {
        throw new Error(`Échec de l'ajout du produit : ${error.message}`);
      }

      return data as Produit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: ProduitUpdate;
    }) => {
      const finalUpdates: ProduitUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('produit')
        .update(finalUpdates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Échec de la modification du produit : ${error.message}`);
      }

      return data as Produit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useDeleteProduit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('produit').delete().eq('id', id);
      if (error) {
        throw new Error(`Échec de la suppression du produit : ${error.message}`);
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: async ({
      file,
      bucket,
      folder,
      productId,
      type,
    }: {
      file: File;
      bucket?: string;
      folder?: string;
      productId?: string;
      type?: ProductImageType;
    }) => {
      return uploadProductImage(file, { bucket, folder, productId, type });
    },
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
        throw new Error(`Échec de la récupération du produit : ${error.message}`);
      }

      return data as Produit;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
}

