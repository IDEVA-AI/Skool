import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import { useEffect, useState } from 'react';

export interface Conversation {
  id: string;
  type: 'dm' | 'group';
  name: string | null;
  community_id: string | null;
  course_id: number | null;
  created_at: string;
  updated_at: string;
  participants?: ConversationParticipant[];
  last_message?: Message;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string | null;
  is_admin: boolean;
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
  is_deleted: boolean;
  sender?: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

/**
 * Busca todas as conversas do usuário atual
 */
export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Buscar conversas em que o usuário participa
      const { data: participants, error: participantsError } = await supabase
        .from('conversations_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantsError) throw participantsError;
      if (!participants || participants.length === 0) return [];

      const conversationIds = participants.map(p => p.conversation_id);

      // Buscar detalhes das conversas
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Buscar participantes de todas as conversas de uma vez (otimização)
      const allConversationIds = conversations?.map(c => c.id) || [];
      const { data: allParticipants } = await supabase
        .from('conversations_participants')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .in('conversation_id', allConversationIds);

      // Organizar participantes por conversa
      const participantsByConversation = new Map<string, typeof allParticipants>();
      allParticipants?.forEach(p => {
        const convId = p.conversation_id;
        if (!participantsByConversation.has(convId)) {
          participantsByConversation.set(convId, []);
        }
        participantsByConversation.get(convId)?.push(p);
      });

      // Buscar última mensagem e calcular não lidas para cada conversa
      const conversationsWithLastMessage = await Promise.all(
        (conversations || []).map(async (conv) => {
          const { data: lastMessage } = await supabase
            .from('messages')
            .select(`
              *,
              users:sender_id (
                id,
                name,
                email,
                avatar_url
              )
            `)
            .eq('conversation_id', conv.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Buscar participantes desta conversa
          const participantsData = participantsByConversation.get(conv.id) || [];

          // Calcular mensagens não lidas para o usuário atual
          const currentUserParticipant = participantsData.find(p => p.user_id === user.id);
          const lastReadAt = currentUserParticipant?.last_read_at || '1970-01-01';
          
          // Contar mensagens não lidas: após last_read_at, não deletadas, e que não foram enviadas pelo próprio usuário
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_deleted', false)
            .neq('sender_id', user.id) // Excluir mensagens do próprio usuário
            .gt('created_at', lastReadAt);

          return {
            ...conv,
            last_message: lastMessage || undefined,
            participants: participantsData,
            unread_count: unreadCount || 0,
          } as Conversation;
        })
      );

      return conversationsWithLastMessage;
    },
    enabled: !!user,
  });
}

/**
 * Busca detalhes de uma conversa específica
 */
export function useConversation(conversationId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conversation', conversationId, user?.id],
    queryFn: async () => {
      if (!conversationId || !user) return null;

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;

      // Buscar participantes
      const { data: participants } = await supabase
        .from('conversations_participants')
        .select(`
          *,
          users:user_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId);

      return {
        ...data,
        participants: participants || [],
      } as Conversation;
    },
    enabled: !!conversationId && !!user,
  });
}

/**
 * Busca mensagens de uma conversa
 */
export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);

  const query = useQuery({
    queryKey: ['messages', conversationId, user?.id],
    queryFn: async () => {
      if (!conversationId || !user) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          users:sender_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!conversationId && !!user,
  });

  // Subscrição em tempo real para novas mensagens
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Buscar dados completos da mensagem incluindo sender
          const { data: messageData } = await supabase
            .from('messages')
            .select(`
              *,
              users:sender_id (
                id,
                name,
                email,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (messageData && !messageData.is_deleted) {
            setRealtimeMessages((prev) => {
              // Evitar duplicatas
              if (prev.some(m => m.id === messageData.id)) {
                return prev;
              }
              return [...prev, messageData as Message];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      setRealtimeMessages([]);
    };
  }, [conversationId, user]);

  // Resetar mensagens em tempo real quando a query é refeita
  useEffect(() => {
    if (query.data) {
      setRealtimeMessages([]);
    }
  }, [query.data?.length]);

  // Combinar mensagens da query com mensagens em tempo real
  const allMessages = [...(query.data || []), ...realtimeMessages]
    .filter((msg, index, self) => 
      index === self.findIndex((m) => m.id === msg.id)
    )
    .sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  return {
    ...query,
    data: allMessages,
  };
}

/**
 * Envia uma mensagem
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
        })
        .select(`
          *,
          users:sender_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * Cria uma nova conversa (DM ou grupo)
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      type,
      participantIds,
      name,
      communityId,
      courseId,
    }: {
      type: 'dm' | 'group';
      participantIds: string[];
      name?: string;
      communityId?: string;
      courseId?: number;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Criar conversa
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          type,
          name: type === 'group' ? name : null,
          community_id: communityId || null,
          course_id: courseId || null,
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Adicionar participantes (incluindo o criador)
      const allParticipants = [...new Set([user.id, ...participantIds])];
      const { error: participantsError } = await supabase
        .from('conversations_participants')
        .insert(
          allParticipants.map((participantId) => ({
            conversation_id: conversation.id,
            user_id: participantId,
            is_admin: participantId === user.id && type === 'group',
          }))
        );

      if (participantsError) throw participantsError;

      return conversation as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * Marca mensagens como lidas
 */
export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('conversations_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, conversationId) => {
      // Invalidar queries para recalcular contadores
      queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId, user?.id] });
    },
  });
}

/**
 * Busca contagem de mensagens não lidas em todas as conversas
 */
export function useUnreadMessagesCount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: conversations } = useConversations();

  // Subscrição em tempo real para atualizar contador quando novas mensagens chegam ou são marcadas como lidas
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`unread-messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Invalidar queries para recalcular contadores quando nova mensagem chega
          queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations_participants',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Invalidar queries quando last_read_at é atualizado
          queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Calcular total de mensagens não lidas
  const totalUnread = conversations?.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) || 0;

  return totalUnread;
}

