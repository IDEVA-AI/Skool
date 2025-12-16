import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-user-role.ts:11',message:'useUserRole queryFn entry',data:{userId:user?.id,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('role, email, name')
        .eq('id', user.id)
        .single();

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-user-role.ts:18',message:'useUserRole query result',data:{hasError:!!error,errorCode:error?.code,errorMessage:error?.message,role:data?.role,email:data?.email,userId:user.id,userEmailFromAuth:user.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      return data?.role as 'admin' | 'student' | null;
    },
    enabled: !!user,
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    // Garantir que sempre use o valor mais recente do cache
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

export function useIsAdmin() {
  const { data: role, isLoading, isError, error } = useUserRole();
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-user-role.ts:34',message:'useIsAdmin called',data:{role,isLoading,isError,error:error?.message,result:isLoading?undefined:role==='admin'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  // Se está carregando ou houve erro, retorna undefined para indicar estado desconhecido
  if (isLoading || isError) return undefined;
  
  // Se role é null ou undefined, retorna false (não é admin)
  if (role === null || role === undefined) return false;
  
  // Retorna true apenas se role é exatamente 'admin'
  return role === 'admin';
}

export function useUserRoleData() {
  return useUserRole();
}

