import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import { useEffect } from 'react';

export interface Notification {
  id: string;
  user_id: string;
  type: 'comment' | 'reply' | 'mention' | 'post' | 'lesson' | 'announcement' | 'invite';
  reference_id: string;
  reference_type: 'post' | 'comment' | 'course' | 'community' | 'invite';
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Busca todas as notificações do usuário atual
 */
export function useNotifications(limit?: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Notification[];
    },
    enabled: !!user,
  });
}

/**
 * Busca contagem de notificações não lidas
 */
export function useUnreadNotificationCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unread-notification-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
}

/**
 * Marca uma notificação como lida
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count', user?.id] });
    },
  });
}

/**
 * Marca todas as notificações como lidas
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count', user?.id] });
    },
  });
}

/**
 * Hook para subscrição em tempo real de notificações
 */
export function useNotificationsRealtime() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Invalidar queries para atualizar a UI quando nova notificação chega
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          queryClient.invalidateQueries({ queryKey: ['unread-notification-count', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Invalidar queries quando notificação é marcada como lida
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          queryClient.invalidateQueries({ queryKey: ['unread-notification-count', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

