import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-guard.tsx:6',message:'AuthGuard render',data:{hasUser:!!user,loading,userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f7f539cc-af4e-42c4-bdaa-abc176a59b89',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-guard.tsx:12',message:'AuthGuard useEffect',data:{loading,hasUser:!!user,willRedirect:!loading&&!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

