import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCourse } from '@/hooks/use-courses';
import { getCourseCoverImageUrl } from '@/hooks/use-courses';
import { Loader2, Lock, Check, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function PurchasePage() {
  const [, setLocation] = useLocation();
  const [courseId, setCourseId] = useState<number | null>(null);

  // Extrair courseId da query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('courseId');
    if (id) {
      setCourseId(parseInt(id));
    }
  }, []);

  const { data: course, isLoading } = useCourse(courseId || 0);

  if (!courseId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Curso não especificado</p>
              <Button 
                className="mt-4" 
                onClick={() => setLocation('/courses')}
              >
                Voltar para Cursos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Curso não encontrado</p>
              <Button 
                className="mt-4" 
                onClick={() => setLocation('/courses')}
              >
                Voltar para Cursos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const coverImageUrl = getCourseCoverImageUrl(course);

  const handlePurchase = () => {
    // TODO: Integrar com Stripe ou outro gateway de pagamento
    // Por enquanto, apenas mostra mensagem
    alert('Integração de pagamento será implementada em breve. Por enquanto, entre em contato para adquirir o curso.');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Course Info */}
          <div className="space-y-6">
            {coverImageUrl ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <img 
                  src={coverImageUrl} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Lock className="h-16 w-16 text-primary/50" />
              </div>
            )}

            <div>
              <h1 className="text-3xl font-heading font-bold mb-4">{course.title}</h1>
              {course.description && (
                <p className="text-muted-foreground leading-relaxed">{course.description}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">O que você vai aprender:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Acesso completo ao conteúdo do curso</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Suporte da comunidade</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Acesso vitalício</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Purchase Card */}
          <div className="flex flex-col">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Adquirir Curso</CardTitle>
                <CardDescription>
                  Complete o pagamento para ter acesso imediato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Curso</span>
                    <span className="font-medium">{course.title}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">R$ 0,00</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * Preço será configurado na integração de pagamento
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePurchase}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Comprar Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-xs text-center text-muted-foreground space-y-1">
                  <p>Pagamento seguro e protegido</p>
                  <p>Garantia de 7 dias ou seu dinheiro de volta</p>
                </div>
              </CardContent>
            </Card>

            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setLocation('/courses')}
            >
              Voltar para Cursos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

