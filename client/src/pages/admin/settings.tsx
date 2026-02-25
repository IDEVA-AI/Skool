import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Save, Palette, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useSelectedCommunity } from '@/contexts/community-context';
import { useUpdateCommunity } from '@/hooks/use-communities';
import { colorPresets, type ColorPreset, applyColorPreset } from '@/lib/color-presets';
import { cn } from '@/lib/utils';

export default function AdminSettings() {
  const { toast } = useToast();
  const { selectedCommunity } = useSelectedCommunity();
  const updateCommunity = useUpdateCommunity();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ColorPreset>('slate');

  // Carregar tema atual da comunidade
  useEffect(() => {
    if (selectedCommunity?.settings) {
      const theme = (selectedCommunity.settings as any)?.theme;
      if (theme && typeof theme === 'string' && theme in colorPresets) {
        setSelectedTheme(theme as ColorPreset);
        applyColorPreset(theme as ColorPreset);
      } else {
        applyColorPreset('slate');
      }
    } else {
      applyColorPreset('slate');
    }
  }, [selectedCommunity]);

  // Restaurar tema original quando componente desmontar ou comunidade mudar
  useEffect(() => {
    return () => {
      // Restaurar tema salvo ao sair da página
      if (selectedCommunity?.settings) {
        const theme = (selectedCommunity.settings as any)?.theme;
        if (theme && typeof theme === 'string' && theme in colorPresets) {
          applyColorPreset(theme as ColorPreset);
        } else {
          applyColorPreset('slate');
        }
      } else {
        applyColorPreset('slate');
      }
    };
  }, [selectedCommunity]);

  const handleThemeChange = (theme: ColorPreset) => {
    setSelectedTheme(theme);
    // Aplicar preview imediatamente
    applyColorPreset(theme);
  };

  const handleSaveTheme = async () => {
    if (!selectedCommunity) {
      toast({
        title: 'Erro',
        description: 'Nenhuma comunidade selecionada',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateCommunity.mutateAsync({
        id: selectedCommunity.id,
        settings: {
          ...selectedCommunity.settings,
          theme: selectedTheme,
        },
      });
      toast({
        title: 'Tema salvo',
        description: 'O tema de cores foi atualizado com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o tema',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
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
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configurações gerais serão implementadas em breve.
            </p>
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
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tema de Cores
            </CardTitle>
            <CardDescription>
              Personalize as cores da sua comunidade escolhendo um dos temas disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(Object.entries(colorPresets) as [ColorPreset, typeof colorPresets[ColorPreset]][]).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  className={cn(
                    'relative p-4 rounded-lg border-2 transition-all',
                    'hover:scale-105 hover:shadow-md',
                    selectedTheme === key
                      ? 'border-primary shadow-md'
                      : 'border-zinc-200 hover:border-primary/50'
                  )}
                >
                  {selectedTheme === key && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: `hsl(${preset.primary})` }}
                      />
                      <div
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: `hsl(${preset.secondary})` }}
                      />
                    </div>
                    <p className="text-sm font-medium text-left">{preset.name}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveTheme} 
                disabled={isSaving || updateCommunity.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving || updateCommunity.isPending ? 'Salvando...' : 'Salvar Tema'}
              </Button>
            </div>
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

