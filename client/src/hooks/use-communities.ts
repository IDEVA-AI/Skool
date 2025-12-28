import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  logo_data: string | null;
  cover_data: string | null;
  logo_mime_type: string | null;
  cover_mime_type: string | null;
  owner_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  access_type: 'invite_only' | 'public_paid' | 'both';
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Helper para obter URL da imagem (prioriza data, depois url)
export function getCommunityLogoUrl(community: Community | null): string | null {
  if (!community) return null;
  if (community.logo_data) {
    return `data:${community.logo_mime_type || 'image/png'};base64,${community.logo_data}`;
  }
  return community.logo_url;
}

export function getCommunityCoverUrl(community: Community | null): string | null {
  if (!community) return null;
  if (community.cover_data) {
    return `data:${community.cover_mime_type || 'image/png'};base64,${community.cover_data}`;
  }
  return community.cover_url;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  stripe_subscription_id: string | null;
  joined_at: string;
}

export interface CommunityInvite {
  id: string;
  community_id: string;
  email: string;
  token: string;
  expires_at: string;
  created_by: string;
  used_at: string | null;
  created_at: string;
}

// Buscar comunidade por slug
export function useCommunityBySlug(slug: string | null) {
  return useQuery({
    queryKey: ['community', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data as Community;
    },
    enabled: !!slug,
  });
}

// Buscar todas as comunidades do usuário (owner ou member)
export function useUserCommunities() {
  return useQuery({
    queryKey: ['user-communities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Community[];
    },
  });
}

// Buscar comunidades onde o usuário é owner (para admin)
export function useOwnedCommunities() {
  return useQuery({
    queryKey: ['owned-communities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Community[];
    },
  });
}

// Criar comunidade
export function useCreateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      slug: string;
      name: string;
      description?: string;
      logo_url?: string;
      cover_url?: string;
      logo_data?: string;
      cover_data?: string;
      logo_mime_type?: string;
      cover_mime_type?: string;
      access_type?: 'invite_only' | 'public_paid' | 'both';
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se é admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData?.role !== 'admin') {
        throw new Error('Apenas administradores podem criar comunidades');
      }

      const { data: community, error } = await supabase
        .from('communities')
        .insert({
          ...data,
          owner_id: user.id,
          access_type: data.access_type || 'invite_only',
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar owner como member com role 'owner'
      await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'owner',
        });

      return community as Community;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-communities'] });
      queryClient.invalidateQueries({ queryKey: ['owned-communities'] });
    },
  });
}

// Atualizar comunidade
export function useUpdateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      description?: string;
      logo_url?: string;
      cover_url?: string;
      logo_data?: string;
      cover_data?: string;
      logo_mime_type?: string;
      cover_mime_type?: string;
      access_type?: 'invite_only' | 'public_paid' | 'both';
      settings?: Record<string, any>;
    }) => {
      const { error } = await supabase
        .from('communities')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
      queryClient.invalidateQueries({ queryKey: ['user-communities'] });
      queryClient.invalidateQueries({ queryKey: ['owned-communities'] });
    },
  });
}

// Deletar comunidade
export function useDeleteCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-communities'] });
      queryClient.invalidateQueries({ queryKey: ['owned-communities'] });
    },
  });
}

// Buscar membros de uma comunidade
export function useCommunityMembers(communityId: string | null) {
  return useQuery({
    queryKey: ['community-members', communityId],
    queryFn: async () => {
      if (!communityId) return [];

      const { data, error } = await supabase
        .from('community_members')
        .select(`
          *,
          users:user_id (
            id,
            email,
            name,
            avatar_url
          )
        `)
        .eq('community_id', communityId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data as (CommunityMember & { users: any })[];
    },
    enabled: !!communityId,
  });
}

// Criar convite
export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      communityId,
      email,
      expiresInDays = 7,
    }: {
      communityId: string;
      email: string;
      expiresInDays?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Gerar token único
      const token = crypto.randomUUID();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const { data, error } = await supabase
        .from('community_invites')
        .insert({
          community_id: communityId,
          email,
          token,
          expires_at: expiresAt.toISOString(),
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CommunityInvite;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['community-invites', variables.communityId] });
    },
  });
}

// Buscar convites de uma comunidade
export function useCommunityInvites(communityId: string | null) {
  return useQuery({
    queryKey: ['community-invites', communityId],
    queryFn: async () => {
      if (!communityId) return [];

      const { data, error } = await supabase
        .from('community_invites')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CommunityInvite[];
    },
    enabled: !!communityId,
  });
}

// Aceitar convite
export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar convite
      const { data: invite, error: inviteError } = await supabase
        .from('community_invites')
        .select('*')
        .eq('token', token)
        .single();

      if (inviteError) throw new Error('Convite inválido');
      if (invite.used_at) throw new Error('Convite já foi usado');
      if (new Date(invite.expires_at) < new Date()) throw new Error('Convite expirado');

      // Verificar email se especificado
      if (invite.email && invite.email !== user.email) {
        throw new Error('Este convite é para outro email');
      }

      // Adicionar como membro
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: invite.community_id,
          user_id: user.id,
          role: 'member',
        });

      if (memberError) {
        // Se já é membro, apenas marcar convite como usado
        if (memberError.code === '23505') {
          // Unique constraint violation
        } else {
          throw memberError;
        }
      }

      // Marcar convite como usado
      await supabase
        .from('community_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id);

      return invite.community_id;
    },
    onSuccess: (communityId) => {
      queryClient.invalidateQueries({ queryKey: ['community-members', communityId] });
      queryClient.invalidateQueries({ queryKey: ['community-invites', communityId] });
      queryClient.invalidateQueries({ queryKey: ['user-communities'] });
    },
  });
}

