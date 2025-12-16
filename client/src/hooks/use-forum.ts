import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function usePosts(courseId: number) {
  return useQuery({
    queryKey: ['posts', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('course_id', courseId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

export function useComments(postId: number) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!postId,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', variables.courseId] });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      content, 
      parentId 
    }: { 
      postId: number; 
      content: string; 
      parentId?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      content 
    }: { 
      commentId: number; 
      content: string; 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se o comentário pertence ao usuário ou se é admin
      const { data: comment } = await supabase
        .from('comments')
        .select('user_id, post_id')
        .eq('id', commentId)
        .single();

      if (!comment) throw new Error('Comentário não encontrado');

      // Verificar se é admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = userData?.role === 'admin';
      
      // Apenas o dono ou admin pode editar
      if (comment.user_id !== user.id && !isAdmin) {
        throw new Error('Você não tem permissão para editar este comentário');
      }

      const { data, error } = await supabase
        .from('comments')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar queries de comentários do post
      queryClient.invalidateQueries({ queryKey: ['comments', data.post_id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId }: { commentId: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se o comentário pertence ao usuário ou se é admin
      const { data: comment } = await supabase
        .from('comments')
        .select('user_id, post_id')
        .eq('id', commentId)
        .single();

      if (!comment) throw new Error('Comentário não encontrado');

      // Verificar se é admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = userData?.role === 'admin';
      
      // Apenas o dono ou admin pode deletar
      if (comment.user_id !== user.id && !isAdmin) {
        throw new Error('Você não tem permissão para deletar este comentário');
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return { postId: comment.post_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
    },
  });
}

