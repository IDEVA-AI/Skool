import { useUserRole } from '@/hooks/use-user-role';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AdminGuard({ 
  children, 
  fallback,
  redirectTo = '/'
}: AdminGuardProps) {
  const { user, loading: authLoading } = useAuth();
  // Usar useUserRole diretamente para ter mais controle sobre o estado
  const { data: role, isLoading: roleLoading, isError: roleError } = useUserRole();
  const [, setLocation] = useLocation();

  // Calcular isAdmin diretamente aqui para evitar race conditions
  const isAdmin = roleLoading || roleError ? undefined : role === 'admin';

  // Aguardar até que tanto a autenticação quanto a role sejam carregadas
  // isAdmin === undefined significa que ainda está carregando ou houve erro
  const isLoading = authLoading || roleLoading || isAdmin === undefined;

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin-guard.tsx:23',message:'AdminGuard render',data:{userId:user?.id,userEmail:user?.email,role,roleLoading,roleError,isAdmin,isAdminType:typeof isAdmin,isLoading,authLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin-guard.tsx:34',message:'AdminGuard useEffect entry',data:{userId:user?.id,userEmail:user?.email,role,roleType:typeof role,roleLoading,roleError,isAdmin,isAdminType:typeof isAdmin,isLoading,authLoading,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'audit1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Não fazer nada enquanto está carregando
    if (isLoading || roleLoading) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin-guard.tsx:40',message:'AdminGuard still loading',data:{isLoading,authLoading,roleLoading,role,roleType:typeof role,isAdmin},timestamp:Date.now(),sessionId:'debug-session',runId:'audit1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }

    // Só redirecionar se não estiver carregando e não for admin
    if (!user) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin-guard.tsx:47',message:'AdminGuard redirecting no user',data:{currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'audit1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setLocation('/login');
      return;
    }
    
    // CORREÇÃO: Só redirecionar se role foi DEFINITIVAMENTE carregada (não é null/undefined) e não é admin
    // Se role é null ou undefined, ainda está carregando ou não existe, então não redirecionar
    if (!roleLoading && role !== null && role !== undefined && role !== 'admin') {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin-guard.tsx:54',message:'AdminGuard redirecting not admin',data:{userId:user.id,userEmail:user.email,role,roleType:typeof role,roleLoading,isAdmin,currentPath:window.location.pathname,redirectTo},timestamp:Date.now(),sessionId:'debug-session',runId:'audit1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setLocation(redirectTo);
      return;
    }
    
    // Se role é null ou undefined, ainda está carregando - não fazer nada
    if (role === null || role === undefined) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin-guard.tsx:62',message:'AdminGuard role still null/undefined',data:{userId:user.id,userEmail:user.email,role,roleType:typeof role,roleLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'audit1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }
    
    if (role === 'admin') {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin-guard.tsx:68',message:'AdminGuard access granted',data:{userId:user.id,userEmail:user.email,role,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'audit1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
  }, [user, role, roleLoading, roleError, isLoading, redirectTo, setLocation]);

  // Mostrar loader enquanto carrega
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário, não renderizar nada (o useEffect vai redirecionar)
  if (!user) {
    return null;
  }

  // Se não é admin, não renderizar nada (o useEffect vai redirecionar)
  // Só renderizar se role foi DEFINITIVAMENTE carregada e é 'admin'
  // Se role é null/undefined, ainda está carregando - não renderizar
  if (roleLoading || role === null || role === undefined || role !== 'admin') {
    return null;
  }

  // Se chegou aqui, é admin e pode renderizar
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'admin-guard.tsx:92',message:'AdminGuard rendering children',data:{userId:user?.id,role,isAdmin},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return <>{children}</>;
}

