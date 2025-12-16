import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Lock, Crown } from "lucide-react";
import coverPurple from "@assets/generated_images/minimalist_purple_premium_course_cover.png";

export default function Premium() {
  return (
    <div className="space-y-12 pb-12">
      <header className="text-center max-w-2xl mx-auto space-y-4 pt-8">
        <Badge variant="secondary" className="bg-premium/10 text-premium hover:bg-premium/20 border-premium/20 px-3 py-1">
          <Crown className="h-3.5 w-3.5 mr-1.5" /> Acesso Premium
        </Badge>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight">
          Desbloqueie seu potencial máximo.
        </h1>
        <p className="text-lg text-muted-foreground">
          Tenha acesso exclusivo a masterclasses avançadas, mentoria direta e uma rede privada de alto desempenho.
        </p>
      </header>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-slate-900 text-white shadow-xl mx-auto max-w-4xl border border-white/10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-premium/20 to-transparent"></div>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Masterclass de Pensamento Estratégico Avançado</h2>
            <p className="text-slate-300 leading-relaxed">
              Nosso principal curso premium. Aprenda a navegar em sistemas complexos, tomar melhores decisões e liderar com clareza.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 border-0">
                Desbloquear Agora <Lock className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                Ver Ementa
              </Button>
            </div>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl border border-white/10 rotate-2 hover:rotate-0 transition-transform duration-500">
             <img src={coverPurple} alt="Premium Course" className="object-cover w-full h-full" />
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <Lock className="h-12 w-12 text-white/80" />
             </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card className="border-border/50 shadow-sm bg-card hover:border-premium/30 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-premium/10 flex items-center justify-center text-premium mb-2">
              <Zap className="h-5 w-5" />
            </div>
            <CardTitle>Conteúdo Exclusivo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Acesso a uma biblioteca com mais de 50 horas de conteúdo avançado não disponível nos cursos públicos.
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm bg-card hover:border-premium/30 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
              <Star className="h-5 w-5" />
            </div>
            <CardTitle>Suporte Prioritário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Linha direta com instrutores e resposta prioritária em todas as suas dúvidas e projetos.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card hover:border-premium/30 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
              <Crown className="h-5 w-5" />
            </div>
            <CardTitle>Círculo Interno</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Junte-se ao canal privado para membros premium para networking e colaboração.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing/Upgrade Section */}
      <div className="text-center space-y-6 pt-8">
        <h2 className="text-2xl font-bold">Pronto para fazer o upgrade?</h2>
        <div className="inline-block">
          <Button size="lg" className="bg-premium hover:bg-premium/90 text-white min-w-[200px] h-12 text-base shadow-lg shadow-premium/25">
            Obter Acesso Premium — R$ 49/mês
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Cancele a qualquer momento. Garantia de reembolso de 14 dias.</p>
      </div>
    </div>
  );
}
