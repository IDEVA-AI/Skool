import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export interface SavedPost {
  id: string;
  user_id: string;
  post_id: number;
  created_at: string;
}

/**
 * Busca todos os posts salvos pelo usuário atual
 */
export function useSavedPosts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-posts', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavedPost[];
    },
    enabled: !!user,
  });
}

/**
 * Busca IDs dos posts salvos pelo usuário atual (para verificação rápida)
 */
export function useSavedPostIds() {
  const { data: savedPosts } = useSavedPosts();
  
  return savedPosts?.map(sp => sp.post_id) || [];
}

/**
 * Verifica se um post específico está salvo
 */
export function useIsPostSaved(postId: number) {
  const savedPostIds = useSavedPostIds();
  return savedPostIds.includes(postId);
}

/**
 * Salva um post
 */
export function useSavePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: number) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('saved_posts')
        .insert({
          user_id: user.id,
          post_id: postId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SavedPost;
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['saved-posts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['is-post-saved', postId, user?.id] });
    },
  });
}

/**
 * Remove um post salvo
 */
export function useUnsavePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: number) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['saved-posts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['is-post-saved', postId, user?.id] });
    },
  });
}

/**
 * Busca posts salvos com detalhes completos
 */
export function useSavedPostsWithDetails() {
  const { user } = useAuth();
  const { data: savedPosts } = useSavedPosts();

  return useQuery({
    queryKey: ['saved-posts-details', user?.id],
    queryFn: async () => {
      if (!savedPosts || savedPosts.length === 0) return [];

      const postIds = savedPosts.map(sp => sp.post_id);

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email,
            avatar_url
          ),
          courses:course_id (
            id,
            title
          )
        `)
        .in('id', postIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!savedPosts && savedPosts.length > 0,
  });
}

