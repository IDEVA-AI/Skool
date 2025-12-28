import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as postsService from '@/services/posts';
import * as commentsService from '@/services/comments';

export function usePosts(courseId: number) {
  return useQuery({
    queryKey: ['posts', courseId],
    queryFn: () => postsService.getPostsByCourse(courseId),
    enabled: !!courseId,
  });
}

export function useComments(postId: number) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentsService.getCommentsByPost(postId),
    enabled: !!postId,
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
      return commentsService.createComment({
        post_id: postId,
        content,
        parentId,
      });
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
      return commentsService.updateComment(commentId, content);
    },
    onSuccess: async (data) => {
      // Invalidar queries de comentários do post
      // O serviço retorna o comentário completo, então podemos usar post_id diretamente
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
      return commentsService.deleteComment(commentId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments', data.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
    },
  });
}

