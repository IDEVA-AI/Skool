import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AdminSettings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: 'Configurações salvas',
      description: 'Suas configurações foram salvas com sucesso',
    });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-heading font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações da plataforma
        </p>
      </header>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Configure as opções gerais da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Nome da Plataforma</Label>
              <Input id="platform-name" placeholder="S-K-O-O-L" defaultValue="S-K-O-O-L" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform-description">Descrição</Label>
              <Input id="platform-description" placeholder="Plataforma de cursos online" />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Configure as preferências de notificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configurações de notificação serão implementadas em breve.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>
              Configurações de segurança e privacidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configurações de segurança serão implementadas em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

