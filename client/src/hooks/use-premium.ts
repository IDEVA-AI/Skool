import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

/**
 * Hook para verificar se o usuário tem status premium
 * Premium é definido por ter uma subscription ativa em qualquer comunidade
 */
export function useIsPremium() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['isPremium', user?.id],
    queryFn: async () => {
      if (!user) return false;

      // Verificar se o usuário tem alguma subscription ativa
      const { data, error } = await supabase
        .from('community_members')
        .select('stripe_subscription_id')
        .eq('user_id', user.id)
        .not('stripe_subscription_id', 'is', null)
        .limit(1);

      if (error) {
        console.warn('Erro ao verificar status premium:', error);
        return false;
      }

      return data && data.length > 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
}
