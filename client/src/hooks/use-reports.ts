import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  reportPost,
  getPendingReports,
  getPendingReportsCount,
  updateReportStatus,
  deletePostByAdmin,
} from '@/services/reports';
import { useToast } from '@/hooks/use-toast';

export function useReportPost() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      reporterId,
      reason,
      description,
    }: {
      postId: number;
      reporterId: string;
      reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
      description?: string;
    }) => reportPost(postId, reporterId, reason, description),
    onSuccess: () => {
      toast({ title: 'Denúncia enviada', description: 'Obrigado por nos informar.' });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao denunciar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: getPendingReports,
    staleTime: 30 * 1000,
  });
}

export function usePendingReportsCount() {
  return useQuery({
    queryKey: ['reports', 'pending-count'],
    queryFn: getPendingReportsCount,
    staleTime: 60 * 1000,
  });
}

export function useUpdateReport() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      status,
      reviewerId,
    }: {
      reportId: string;
      status: 'reviewed' | 'dismissed' | 'actioned';
      reviewerId: string;
    }) => updateReportStatus(reportId, status, reviewerId),
    onSuccess: () => {
      toast({ title: 'Denúncia atualizada' });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar denúncia', variant: 'destructive' });
    },
  });
}

export function useDeletePostByAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => deletePostByAdmin(postId),
    onSuccess: () => {
      toast({ title: 'Post deletado' });
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: () => {
      toast({ title: 'Erro ao deletar post', variant: 'destructive' });
    },
  });
}
