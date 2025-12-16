import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAcceptCourseInvite, useCourseInviteByToken } from '@/hooks/use-course-invites';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle, BookOpen, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCourseCoverImageUrl } from '@/hooks/use-courses';

export default function CourseInvitePage() {
  const [, params] = useRoute('/course-invite/:token');
  const [, setLocation] = useLocation();
  const token = params?.token || null;
  
  const acceptInviteMutation = useAcceptCourseInvite();
  const { data: inviteData, isLoading: inviteLoading, error: inviteError } = useCourseInviteByToken(token || '');
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAcceptInvite = async () => {
    if (!token || !isAuthenticated) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado para aceitar o convite',
        variant: 'destructive',
      });
      setLocation('/login');
      return;
    }

    try {
      const courseId = await acceptInviteMutation.mutateAsync(token);
      
      toast({
        title: 'Convite aceito!',
        description: 'Você agora tem acesso ao curso',
      });

      // Redirecionar para o curso
      setLocation(`/courses/${courseId}`);
    } catch (error: any) {
      toast({
        title: 'Erro ao aceitar convite',
        description: error.message || 'Não foi possível aceitar o convite',
        variant: 'destructive',
      });
    }
  };

  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Verificando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inviteData || inviteError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-center">Convite Inválido</CardTitle>
            <CardDescription className="text-center">
              Não foi possível encontrar este convite ou ele já foi usado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => setLocation('/courses')}
            >
              Voltar para Cursos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificar se já foi aceito
  if (inviteData.accepted_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center">Convite Já Aceito</CardTitle>
            <CardDescription className="text-center">
              Este convite já foi utilizado.
            </CardDescription>
          </CardHeader>
          {inviteData.courses && (
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">{inviteData.courses.title}</h3>
              </div>
              <Button 
                className="w-full" 
                onClick={() => setLocation(`/courses/${inviteData.courses!.id}`)}
              >
                Acessar Curso
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  // Verificar se expirou
  if (inviteData.expires_at && new Date(inviteData.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-center">Convite Expirado</CardTitle>
            <CardDescription className="text-center">
              Este convite expirou. Entre em contato para solicitar um novo convite.
            </CardDescription>
          </CardHeader>
          {inviteData.courses && (
            <CardContent>
              <div className="text-center text-sm text-muted-foreground mb-4">
                <p>Curso: <strong>{inviteData.courses.title}</strong></p>
              </div>
            </CardContent>
          )}
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => setLocation('/courses')}
            >
              Voltar para Cursos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const course = inviteData.courses;

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Erro ao carregar informações do curso</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {course.is_locked ? (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
          <CardTitle className="text-center">{course.title}</CardTitle>
          {course.description && (
            <CardDescription className="text-center">
              {course.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Você foi convidado para acessar este curso
            </p>
            {inviteData.email && (
              <p className="text-xs text-muted-foreground">
                Convite para: <strong>{inviteData.email}</strong>
              </p>
            )}
          </div>

          {!isAuthenticated ? (
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => setLocation('/login')}
              >
                Fazer Login para Aceitar
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setLocation('/register')}
              >
                Criar Conta
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full" 
              onClick={handleAcceptInvite}
              disabled={acceptInviteMutation.isPending}
            >
              {acceptInviteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aceitando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aceitar Convite
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

