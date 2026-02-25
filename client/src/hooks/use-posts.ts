import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as postsService from '@/services/posts';

// Buscar posts de todos os cursos em que o usuário está inscrito
export function useAllPosts() {
  return useQuery({
    queryKey: ['all-posts'],
    queryFn: () => postsService.getAllPosts(),
  });
}

// Buscar posts de usuários que o usuário segue
export function useFollowingPosts() {
  return useQuery({
    queryKey: ['following-posts'],
    queryFn: () => postsService.getFollowingPosts(),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, title, content }: { courseId: number; title: string; content: string }) => {
      return postsService.createPost({
        course_id: courseId,
        title,
        content,
      });
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
      return postsService.updatePost(postId, { title, content });
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
      await postsService.deletePost(postId);
      return { success: true, postId };
    },
    onSuccess: async (_, variables) => {
      const { postId } = variables;
      
      // Remover o post do cache imediatamente para atualização visual instantânea
      queryClient.setQueryData(['all-posts'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((post: any) => post.id !== postId);
      });
      
      // Invalidar todas as queries relacionadas a posts
      await queryClient.invalidateQueries({ queryKey: ['all-posts'] });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // Forçar refetch imediato para garantir sincronização com o servidor
      await queryClient.refetchQueries({ 
        queryKey: ['all-posts'],
        type: 'active'
      });
    },
  });
}

export function usePinPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }: { postId: number }) => {
      return postsService.pinPost(postId);
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
      return postsService.unpinPost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

