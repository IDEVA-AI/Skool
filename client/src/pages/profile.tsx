import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Upload, User, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sincronizar valores quando o perfil carregar
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma imagem válida',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Converter para Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remover o prefixo data:image/...;base64,
        const base64Data = base64String.split(',')[1];
        const mimeType = file.type;

        // Atualizar preview
        setAvatarPreview(base64String);

        // Salvar no banco
        await updateProfileMutation.mutateAsync({
          avatar_url: base64Data,
        });

        toast({
          title: 'Foto atualizada',
          description: 'Sua foto de perfil foi atualizada com sucesso',
        });

        setIsUploading(false);
      };
      reader.onerror = () => {
        toast({
          title: 'Erro',
          description: 'Erro ao ler o arquivo',
          variant: 'destructive',
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao fazer upload da imagem',
        variant: 'destructive',
      });
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Preparar avatar_url: se é data URL, extrair apenas o base64
      let avatarUrlToSave: string | null = null;
      if (avatarPreview) {
        if (avatarPreview.startsWith('data:')) {
          // Extrair apenas o base64 (sem o prefixo data:image/...;base64,)
          avatarUrlToSave = avatarPreview.split(',')[1];
        } else if (avatarPreview.startsWith('http')) {
          // Se já é uma URL HTTP, manter como está
          avatarUrlToSave = avatarPreview;
        } else {
          // Se já é base64 puro, usar diretamente
          avatarUrlToSave = avatarPreview;
        }
      }

      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrlToSave,
      });

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o perfil',
        variant: 'destructive',
      });
    }
  };

  const getAvatarUrl = () => {
    if (avatarPreview) {
      // Se já é uma URL completa (data:image ou http), usar diretamente
      if (avatarPreview.startsWith('data:') || avatarPreview.startsWith('http')) {
        return avatarPreview;
      }
      // Se é base64 sem prefixo, adicionar prefixo padrão
      return `data:image/png;base64,${avatarPreview}`;
    }
    // Se não há preview mas há avatar_url no perfil
    if (profile?.avatar_url) {
      if (profile.avatar_url.startsWith('data:') || profile.avatar_url.startsWith('http')) {
        return profile.avatar_url;
      }
      return `data:image/png;base64,${profile.avatar_url}`;
    }
    // Fallback para avatar gerado
    if (user?.email) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || user.email)}`;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-black tracking-tighter text-foreground drop-shadow-sm">Meu Perfil</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Gerencie suas informações pessoais
          </p>
        </header>
        <Card className="bg-white border border-zinc-200 shadow-sm rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black tracking-tighter text-foreground drop-shadow-sm">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Gerencie suas informações pessoais
        </p>
      </header>

      <Card className="bg-white border border-zinc-200 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Atualize seu nome, foto e biografia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Foto de Perfil */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-zinc-200">
              <AvatarImage src={getAvatarUrl() || undefined} />
              <AvatarFallback>
                {(name || user?.email || 'U')[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="avatar-upload">Foto de Perfil</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Alterar Foto
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                {avatarPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAvatarPreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Remover
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou GIF. Máximo 5MB.
              </p>
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              disabled={updateProfileMutation.isPending}
            />
          </div>

          {/* Email (somente leitura) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile?.email || user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado
            </p>
          </div>

          {/* Biografia */}
          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre você..."
              rows={5}
              maxLength={500}
              disabled={updateProfileMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/500 caracteres
            </p>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending || !name.trim()}
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

