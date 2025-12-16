import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Buscar posts de todos os cursos em que o usuário está inscrito
export function useAllPosts() {
  return useQuery({
    queryKey: ['all-posts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Buscar cursos em que o usuário está inscrito
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);

      if (!enrollments || enrollments.length === 0) return [];

      const courseIds = enrollments.map(e => e.course_id);

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
        .in('course_id', courseIds)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Buscar contagem de comentários para cada post
      const postIds = data.map(p => p.id);
      const { data: commentCounts } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds);

      // Criar um mapa de contagem de comentários por post
      const commentCountMap = new Map<number, number>();
      if (commentCounts) {
        commentCounts.forEach(comment => {
          const count = commentCountMap.get(comment.post_id) || 0;
          commentCountMap.set(comment.post_id, count + 1);
        });
      }

      // Adicionar comment_count a cada post
      return data.map(post => ({
        ...post,
        comment_count: commentCountMap.get(post.id) || 0,
      }));
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, title, content }: { courseId: number; title: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          course_id: courseId,
          user_id: user.id,
          title,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      title, 
      content 
    }: { 
      postId: number; 
      title: string; 
      content: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('posts')
        .update({
          title,
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
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
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }: { postId: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function usePinPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }: { postId: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('posts')
        .update({ pinned: true })
        .eq('id', postId)
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
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUnpinPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }: { postId: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('posts')
        .update({ pinned: false })
        .eq('id', postId)
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
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

