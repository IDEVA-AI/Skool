import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (profileData: {
      name?: string;
      bio?: string | null;
      avatar_url?: string | null;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar também o user_metadata do Supabase Auth para manter sincronizado
      // Converter base64 para data URL se necessário para o user_metadata
      let avatarUrlForAuth = profileData.avatar_url;
      if (avatarUrlForAuth && !avatarUrlForAuth.startsWith('data:') && !avatarUrlForAuth.startsWith('http')) {
        // Se é base64 puro, converter para data URL
        avatarUrlForAuth = `data:image/png;base64,${avatarUrlForAuth}`;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          avatar_url: avatarUrlForAuth || undefined,
        },
      });

      if (authError) {
        console.warn('Erro ao atualizar user_metadata:', authError);
        // Não falhar a mutation se apenas o auth update falhar
      }

      return data as UserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Invalidar posts para atualizar avatares nas postagens
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Invalidar comentários também
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

