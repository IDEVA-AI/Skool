import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCommunity, useUpdateCommunity, type Community } from '@/hooks/use-communities';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

interface CommunityFormProps {
  community?: Community | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CommunityForm({ community, open, onOpenChange, onSuccess }: CommunityFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [accessType, setAccessType] = useState<'invite_only' | 'public_paid' | 'both'>('invite_only');

  const createMutation = useCreateCommunity();
  const updateMutation = useUpdateCommunity();
  const { toast } = useToast();

  // Converter arquivo para base64
  const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover o prefixo "data:image/png;base64," e pegar apenas os dados
        const base64 = result.split(',')[1];
        const mimeType = file.type || 'image/png';
        resolve({ data: base64, mimeType });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Gerar slug automaticamente a partir do nome
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
      .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim
  };

  useEffect(() => {
    if (community) {
      setName(community.name || '');
      setSlug(community.slug || '');
      setDescription(community.description || '');
      setLogoUrl(community.logo_url || '');
      setCoverUrl(community.cover_url || '');
      setAccessType(community.access_type || 'invite_only');
      
      // Mostrar preview de logo (prioriza data, depois url)
      if (community.logo_data) {
        setLogoPreview(`data:${community.logo_mime_type || 'image/png'};base64,${community.logo_data}`);
      } else {
        setLogoPreview(community.logo_url || '');
      }
      
      // Mostrar preview de capa (prioriza data, depois url)
      if (community.cover_data) {
        setCoverPreview(`data:${community.cover_mime_type || 'image/png'};base64,${community.cover_data}`);
      } else {
        setCoverPreview(community.cover_url || '');
      }
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setLogoUrl('');
      setCoverUrl('');
      setLogoFile(null);
      setCoverFile(null);
      setLogoPreview('');
      setCoverPreview('');
      setAccessType('invite_only');
    }
  }, [community, open]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione uma imagem',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: 'A imagem deve ter no máximo 5MB',
          variant: 'destructive',
        });
        return;
      }
      setLogoFile(file);
      setLogoUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione uma imagem',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: 'A imagem deve ter no máximo 5MB',
          variant: 'destructive',
        });
        return;
      }
      setCoverFile(file);
      setCoverUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setLogoUrl('');
    // Limpar dados do banco também será feito no submit (passando undefined)
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview('');
    setCoverUrl('');
    // Limpar dados do banco também será feito no submit (passando undefined)
  };

  // Auto-gerar slug quando o nome mudar (apenas na criação)
  useEffect(() => {
    if (!community && name) {
      setSlug(generateSlug(name));
    }
  }, [name, community]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (!slug.trim()) {
      toast({
        title: 'Erro',
        description: 'O slug é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    // Validar formato do slug
    if (!/^[a-z0-9-]+$/.test(slug)) {
      toast({
        title: 'Erro',
        description: 'O slug deve conter apenas letras minúsculas, números e hífens',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Converter arquivos para base64 se houver
      let logoData: string | null | undefined;
      let logoMimeType: string | null | undefined;
      let coverData: string | null | undefined;
      let coverMimeType: string | null | undefined;
      let finalLogoUrl: string | null | undefined = logoUrl.trim() || null;
      let finalCoverUrl: string | null | undefined = coverUrl.trim() || null;

      // Se não tem preview e não tem URL, limpar dados do banco
      if (!logoPreview && !logoUrl.trim()) {
        logoData = null;
        logoMimeType = null;
        finalLogoUrl = null;
      } else if (logoFile) {
        try {
          const { data, mimeType } = await fileToBase64(logoFile);
          logoData = data;
          logoMimeType = mimeType;
          // Limpar URL se tiver arquivo
          finalLogoUrl = null;
        } catch (error) {
          toast({
            title: 'Erro',
            description: 'Não foi possível processar o arquivo do logo',
            variant: 'destructive',
          });
          return;
        }
      } else if (logoUrl.trim()) {
        // Se tem URL mas não tem arquivo novo, manter URL e limpar data
        logoData = null;
        logoMimeType = null;
      }

      // Se não tem preview e não tem URL, limpar dados do banco
      if (!coverPreview && !coverUrl.trim()) {
        coverData = null;
        coverMimeType = null;
        finalCoverUrl = null;
      } else if (coverFile) {
        try {
          const { data, mimeType } = await fileToBase64(coverFile);
          coverData = data;
          coverMimeType = mimeType;
          // Limpar URL se tiver arquivo
          finalCoverUrl = null;
        } catch (error) {
          toast({
            title: 'Erro',
            description: 'Não foi possível processar o arquivo da capa',
            variant: 'destructive',
          });
          return;
        }
      } else if (coverUrl.trim()) {
        // Se tem URL mas não tem arquivo novo, manter URL e limpar data
        coverData = null;
        coverMimeType = null;
      }

      const communityData: any = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        access_type: accessType,
      };

      // Incluir campos de imagem apenas se foram definidos
      if (logoData !== undefined) communityData.logo_data = logoData;
      if (logoMimeType !== undefined) communityData.logo_mime_type = logoMimeType;
      if (finalLogoUrl !== undefined) communityData.logo_url = finalLogoUrl;
      
      if (coverData !== undefined) communityData.cover_data = coverData;
      if (coverMimeType !== undefined) communityData.cover_mime_type = coverMimeType;
      if (finalCoverUrl !== undefined) communityData.cover_url = finalCoverUrl;

      if (community) {
        await updateMutation.mutateAsync({ id: community.id, ...communityData });
        toast({
          title: 'Comunidade atualizada!',
          description: 'As alterações foram salvas com sucesso',
        });
      } else {
        await createMutation.mutateAsync(communityData);
        toast({
          title: 'Comunidade criada!',
          description: 'A comunidade foi criada com sucesso',
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a comunidade',
        variant: 'destructive',
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {community ? 'Editar Comunidade' : 'Criar Nova Comunidade'}
          </DialogTitle>
          <DialogDescription>
            {community 
              ? 'Atualize as informações da comunidade'
              : 'Preencha os dados para criar uma nova comunidade'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Zona Community"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ex: zona"
              pattern="[a-z0-9-]+"
              required
            />
            <p className="text-xs text-muted-foreground">
              O slug será usado no subdomínio (ex: {slug || 'zona'}.seudominio.com)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a comunidade..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessType">Tipo de Acesso *</Label>
            <Select value={accessType} onValueChange={(value: any) => setAccessType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invite_only">Apenas Convite</SelectItem>
                <SelectItem value="public_paid">Pago (Público)</SelectItem>
                <SelectItem value="both">Convite + Pago</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define como os membros podem acessar a comunidade
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <div className="space-y-2">
              {logoPreview ? (
                <div className="relative inline-block">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="h-20 w-20 rounded-full object-cover border-2 border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={removeLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="logoFile"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logoFile')?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Logo
                  </Button>
                  <span className="text-sm text-muted-foreground">ou</span>
                  <Input
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => {
                      setLogoUrl(e.target.value);
                      setLogoFile(null);
                      setLogoPreview('');
                    }}
                    placeholder="Cole a URL da imagem"
                    type="url"
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Capa</Label>
            <div className="space-y-2">
              {coverPreview ? (
                <div className="relative inline-block">
                  <img 
                    src={coverPreview} 
                    alt="Cover preview" 
                    className="h-32 w-full max-w-md rounded-lg object-cover border-2 border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={removeCover}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="coverFile"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('coverFile')?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Capa
                  </Button>
                  <span className="text-sm text-muted-foreground">ou</span>
                  <Input
                    id="coverUrl"
                    value={coverUrl}
                    onChange={(e) => {
                      setCoverUrl(e.target.value);
                      setCoverFile(null);
                      setCoverPreview('');
                    }}
                    placeholder="Cole a URL da imagem"
                    type="url"
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                community ? 'Salvar Alterações' : 'Criar Comunidade'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

