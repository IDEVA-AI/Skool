import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

// Tipo para bônus com nome e preço
export interface BonusItem {
  name: string;
  price: string;
}

export interface CourseUnlockPage {
  id: number;
  course_id: number;
  title: string | null;
  description: string | null;
  hero_image_url: string | null;
  hero_image_data: string | null;
  hero_image_mime_type: string | null;
  checkout_url: string | null;
  button_text: string | null;
  price_text: string | null;
  bonus_value: string | null;
  features: string[] | null;
  bonus: (string | BonusItem)[] | null; // Suporta formato legado (string) e novo (objeto)
  additional_content: string | null;
  guarantee_text: string | null;
  payment_info: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  courses?: {
    id: number;
    title: string;
  };
}

export interface CreateUnlockPageData {
  course_id: number;
  title?: string;
  description?: string;
  hero_image_url?: string;
  hero_image_data?: string;
  hero_image_mime_type?: string;
  checkout_url?: string;
  button_text?: string;
  price_text?: string;
  bonus_value?: string;
  features?: string[];
  bonus?: BonusItem[];
  additional_content?: string;
  guarantee_text?: string;
  payment_info?: string;
  is_active?: boolean;
}

export function useUnlockPages() {
  return useQuery({
    queryKey: ['unlock-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_unlock_pages')
        .select(`
          *,
          courses (
            id,
            title
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CourseUnlockPage[];
    },
  });
}

export function useUnlockPage(courseId: number) {
  return useQuery({
    queryKey: ['unlock-page', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_unlock_pages')
        .select(`
          *,
          courses (
            id,
            title
          )
        `)
        .eq('course_id', courseId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as CourseUnlockPage | null;
    },
    enabled: !!courseId,
  });
}

export function useCreateUnlockPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (pageData: CreateUnlockPageData) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('course_unlock_pages')
        .insert({
          ...pageData,
          features: pageData.features || [],
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
      return data as CourseUnlockPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unlock-pages'] });
    },
  });
}

export function useUpdateUnlockPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: number;
    } & Partial<CreateUnlockPageData>) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('course_unlock_pages')
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
      return data as CourseUnlockPage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['unlock-pages'] });
      queryClient.invalidateQueries({ queryKey: ['unlock-page', data.course_id] });
    },
  });
}

export function useDeleteUnlockPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('course_unlock_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unlock-pages'] });
    },
  });
}

