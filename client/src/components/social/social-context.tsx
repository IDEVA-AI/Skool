import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { can } from '@/lib/permissions';
import { ReactionType } from '@/types/social';

interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
}

interface SocialContextValue {
  currentUser: CurrentUser | null;
  permissions: {
    canCreate: boolean;
    canModerate: boolean;
  };
  isAuthenticated: boolean;
}

const SocialContext = createContext<SocialContextValue | null>(null);

interface SocialProviderProps {
  children: ReactNode;
}

export function SocialProvider({ children }: SocialProviderProps) {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();

  const value = useMemo<SocialContextValue>(() => {
    const currentUser: CurrentUser | null = user
      ? {
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          avatar:
            user.user_metadata?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.user_metadata?.name || user.email || 'U'
            )}`,
        }
      : null;

    return {
      currentUser,
      permissions: {
        canCreate: can(user, userRole || null, 'create'),
        canModerate: userRole === 'admin',
      },
      isAuthenticated: !!user,
    };
  }, [user, userRole]);

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocialContext() {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocialContext deve ser usado dentro de SocialProvider');
  }
  return context;
}

/**
 * Hook seguro que não lança erro se usado fora do provider
 * Útil para componentes que podem ser usados em ambos os contextos
 */
export function useSocialContextSafe() {
  const context = useContext(SocialContext);
  return context;
}

