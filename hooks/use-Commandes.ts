import { useQuery, UseQueryResult, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export interface Commande {
  id: string;
  numero_commande: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  client_city: string | null;
  client_zipcode: string | null;
  client_country: string | null;
  sous_total: number;
  frais_livraison: number;
  total_commande: number;
  items: any; // JSONB
  statut_commande: 'en_attente' | 'payee' | 'en_preparation' | 'expediee' | 'livree' | 'annulee' | 'remboursee';
  statut_paiement: 'en_attente' | 'paye' | 'echoue' | 'rembourse' | 'partiel' | 'en_attente_paiement';
  created_at: string | null;
  updated_at: string | null;
}

export interface UseCommandesOptions {
  limit?: number;
  statut_commande?: Commande['statut_commande'];
  enabled?: boolean;
}

// Hook pour récupérer les dernières commandes
export function useLastCommandes(
  limit: number = 5
): UseQueryResult<Commande[], Error> {
  return useQuery({
    queryKey: ['commandes', 'last', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Échec de la récupération des commandes: ${error.message}`);
      }

      return (data || []) as Commande[];
    },
    staleTime: 30 * 1000, // 30 secondes - les commandes changent souvent
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Rafraîchir toutes les 30 secondes
    retry: 1,
  });
}

// Hook pour récupérer toutes les commandes avec filtres
export function useCommandes(
  options: UseCommandesOptions = {}
): UseQueryResult<Commande[], Error> {
  const { limit, statut_commande, enabled = true } = options;

  return useQuery({
    queryKey: ['commandes', 'all', limit, statut_commande],
    queryFn: async () => {
      let query = supabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false });

      if (statut_commande) {
        query = query.eq('statut_commande', statut_commande);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Échec de la récupération des commandes: ${error.message}`);
      }

      return (data || []) as Commande[];
    },
    enabled,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// Hook pour récupérer une commande par ID
export function useCommande(commandeId: string): UseQueryResult<Commande | null, Error> {
  return useQuery({
    queryKey: ['commande', commandeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .eq('id', commandeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Échec de la récupération de la commande: ${error.message}`);
      }

      return data as Commande;
    },
    enabled: !!commandeId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// Hook pour mettre à jour le statut d'une commande
export function useUpdateCommandeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commandeId,
      statut_commande,
      statut_paiement,
    }: {
      commandeId: string;
      statut_commande?: Commande['statut_commande'];
      statut_paiement?: Commande['statut_paiement'];
    }) => {
      const updates: Partial<Commande> = {
        updated_at: new Date().toISOString(),
      };

      if (statut_commande) {
        updates.statut_commande = statut_commande;
      }

      if (statut_paiement) {
        updates.statut_paiement = statut_paiement;
      }

      const { data, error } = await supabase
        .from('commandes')
        .update(updates)
        .eq('id', commandeId)
        .select()
        .single();

      if (error) {
        throw new Error(`Échec de la mise à jour de la commande: ${error.message}`);
      }

      return data as Commande;
    },
    onSuccess: () => {
      // Invalider les caches pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      queryClient.invalidateQueries({ queryKey: ['commande'] });
    },
  });
}

// Hook pour supprimer une commande
export function useDeleteCommande() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commandeId: string) => {
      if (!commandeId) {
        throw new Error("ID de commande manquant.");
      }

      const { error } = await supabase
        .from('commandes')
        .delete()
        .eq('id', commandeId);

      if (error) {
        throw new Error(`Échec de la suppression de la commande: ${error.message}`);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      queryClient.invalidateQueries({ queryKey: ['commande'] });
    },
  });
}

// Fonction utilitaire pour formater le statut
export function formatStatutCommande(statut: Commande['statut_commande']): string {
  const statuts: Record<Commande['statut_commande'], string> = {
    en_attente: 'En attente',
    payee: 'Payée',
    en_preparation: 'En préparation',
    expediee: 'Expédiée',
    livree: 'Livrée',
    annulee: 'Annulée',
    remboursee: 'Remboursée',
  };
  return statuts[statut] || statut;
}

// Fonction utilitaire pour formater le statut de paiement
export function formatStatutPaiement(statut: Commande['statut_paiement']): string {
  const statuts: Record<Commande['statut_paiement'], string> = {
    en_attente: 'En attente',
    paye: 'Payé',
    echoue: 'Échoué',
    rembourse: 'Remboursé',
    partiel: 'Partiel',
    en_attente_paiement: 'En attente de paiement',
  };
  return statuts[statut] || statut;
}

// Interface pour les statistiques du dashboard
export interface DashboardStats {
  totalProduits: number;
  totalCommandes: number;
  commandesRecent24h: number;
  totalRevenue: number;
}

// Hook pour récupérer les statistiques du dashboard
export function useDashboardStats(): UseQueryResult<DashboardStats, Error> {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      // Récupérer le total de produits
      const { count: totalProduits, error: productsError } = await supabase
        .from('produit')
        .select('*', { count: 'exact', head: true });

      if (productsError) {
        throw new Error(`Échec de la récupération des produits: ${productsError.message}`);
      }

      // Récupérer le total de commandes
      const { count: totalCommandes, error: ordersError } = await supabase
        .from('commandes')
        .select('*', { count: 'exact', head: true });

      if (ordersError) {
        throw new Error(`Échec de la récupération des commandes: ${ordersError.message}`);
      }

      // Calculer la date d'il y a 24 heures
      const date24hAgo = new Date();
      date24hAgo.setHours(date24hAgo.getHours() - 24);
      const date24hAgoISO = date24hAgo.toISOString();

      // Récupérer les commandes des dernières 24h
      const { count: commandesRecent24h, error: recentOrdersError } = await supabase
        .from('commandes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date24hAgoISO);

      if (recentOrdersError) {
        throw new Error(`Échec de la récupération des commandes récentes: ${recentOrdersError.message}`);
      }

      // Récupérer le total des revenus (somme de total_commande)
      const { data: allCommandes, error: revenueError } = await supabase
        .from('commandes')
        .select('total_commande');

      if (revenueError) {
        throw new Error(`Échec de la récupération des revenus: ${revenueError.message}`);
      }

      const totalRevenue = allCommandes?.reduce((sum, cmd) => sum + (cmd.total_commande || 0), 0) || 0;

      return {
        totalProduits: totalProduits || 0,
        totalCommandes: totalCommandes || 0,
        commandesRecent24h: commandesRecent24h || 0,
        totalRevenue,
      };
    },
    staleTime: 30 * 1000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Rafraîchir toutes les 30 secondes
    retry: 1,
  });
}

