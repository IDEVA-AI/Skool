import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export interface HotmartProduct {
  id: number;
  course_id: number;
  hotmart_product_id: string;
  hotmart_product_name: string | null;
  created_at: string;
  updated_at: string;
  courses?: {
    id: number;
    title: string;
  };
}

export interface HotmartPurchase {
  id: string;
  hotmart_transaction_id: string;
  hotmart_product_id: string;
  buyer_email: string;
  buyer_name: string | null;
  user_id: string | null;
  course_id: number | null;
  status: 'approved' | 'refunded' | 'cancelled' | 'pending';
  raw_payload: Record<string, unknown> | null;
  processed_at: string | null;
  created_at: string;
  courses?: {
    id: number;
    title: string;
  };
  users?: {
    id: string;
    name: string;
    email: string;
  };
}

export function useHotmartProducts() {
  return useQuery({
    queryKey: ['hotmart-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotmart_products')
        .select(`
          *,
          courses (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as HotmartProduct[];
    },
  });
}

export function useHotmartPurchases() {
  return useQuery({
    queryKey: ['hotmart-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotmart_purchases')
        .select(`
          *,
          courses (
            id,
            title
          ),
          users (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as HotmartPurchase[];
    },
  });
}

export function useCreateHotmartProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (productData: {
      course_id: number;
      hotmart_product_id: string;
      hotmart_product_name?: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('hotmart_products')
        .insert({
          course_id: productData.course_id,
          hotmart_product_id: productData.hotmart_product_id,
          hotmart_product_name: productData.hotmart_product_name || null,
        })
        .select(`
          *,
          courses (
            id,
            title
          )
        `)
        .single();

      if (error) throw error;
      return data as HotmartProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotmart-products'] });
    },
  });
}

export function useUpdateHotmartProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: number;
      course_id?: number;
      hotmart_product_id?: string;
      hotmart_product_name?: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('hotmart_products')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          courses (
            id,
            title
          )
        `)
        .single();

      if (error) throw error;
      return data as HotmartProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotmart-products'] });
    },
  });
}

export function useDeleteHotmartProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('hotmart_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotmart-products'] });
    },
  });
}

