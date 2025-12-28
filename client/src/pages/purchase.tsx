import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCourse } from '@/hooks/use-courses';
import { getCourseCoverImageUrl } from '@/hooks/use-courses';
import { useUnlockPage } from '@/hooks/use-unlock-pages';
import { Loader2, Lock, Check, ArrowRight, Gift } from 'lucide-react';
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
  const { data: unlockPage } = useUnlockPage(courseId || 0);

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

  const coverImageUrl = unlockPage?.hero_image_url || getCourseCoverImageUrl(course);
  const pageTitle = unlockPage?.title || course.title;
  const pageDescription = unlockPage?.description || course.description;
  const features = (Array.isArray(unlockPage?.features) ? unlockPage.features : []) || [
    'Acesso completo ao conteúdo do curso',
    'Suporte da comunidade',
    'Acesso vitalício',
  ];
  // Converter bônus para o formato { name, price }, suportando formato legado (string)
  const bonus = Array.isArray(unlockPage?.bonus) 
    ? unlockPage.bonus.map((b: any) => {
        if (typeof b === 'string') {
          return { name: b, price: '' };
        } else if (b && typeof b === 'object' && 'name' in b) {
          return { name: b.name || '', price: b.price || '' };
        }
        return null;
      }).filter(Boolean) as { name: string; price: string }[]
    : [];
  const buttonText = unlockPage?.button_text || 'Desbloquear Agora';
  const priceText = unlockPage?.price_text || 'R$ 0,00';
  const bonusValue = unlockPage?.bonus_value;
  const guaranteeText = unlockPage?.guarantee_text || 'Garantia de 7 dias ou seu dinheiro de volta';
  const paymentInfo = unlockPage?.payment_info || 'Pagamento seguro e protegido';

  const handlePurchase = () => {
    if (unlockPage?.checkout_url) {
      window.open(unlockPage.checkout_url, '_blank');
    } else {
      // TODO: Integrar com Stripe ou outro gateway de pagamento
      alert('Integração de pagamento será implementada em breve. Por enquanto, entre em contato para adquirir o curso.');
    }
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
              <h1 className="text-3xl font-heading font-bold mb-4">{pageTitle}</h1>
              {pageDescription && (
                <p className="text-muted-foreground leading-relaxed">{pageDescription}</p>
              )}
            </div>

            {features && features.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">O que você vai aprender:</h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {bonus && bonus.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Bônus Exclusivos:
                </h3>
                <ul className="space-y-2">
                  {bonus.map((bonusItem, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Gift className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        {bonusItem.name}
                        {bonusItem.price && (
                          <span className="ml-2 text-sm font-medium text-primary">
                            ({bonusItem.price})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {unlockPage?.additional_content && (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: unlockPage.additional_content }}
              />
            )}
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
                  {bonus && bonus.length > 0 && (
                    <div className="space-y-2 py-2">
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <Gift className="h-4 w-4 text-primary" />
                        Bônus Inclusos:
                      </div>
                      <ul className="space-y-1.5">
                        {bonus.map((bonusItem, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Gift className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span className="flex-1">
                              {bonusItem.name}
                              {bonusItem.price && (
                                <span className="ml-1 font-medium text-primary">
                                  ({bonusItem.price})
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {priceText && (
                    <>
                      <Separator />
                      <div className="space-y-1">
                        {bonusValue && (
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>De:</span>
                            <span className="line-through">{bonusValue}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>{bonusValue ? 'Por:' : 'Total'}</span>
                          <span className="text-primary">{priceText}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePurchase}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  {buttonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-xs text-center text-muted-foreground space-y-1">
                  {paymentInfo && <p>{paymentInfo}</p>}
                  {guaranteeText && <p>{guaranteeText}</p>}
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

