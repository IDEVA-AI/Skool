import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateCourse, useUpdateCourse } from '@/hooks/use-admin-courses';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, Lock } from 'lucide-react';
import { useOwnedCommunities } from '@/hooks/use-communities';
import { Switch } from '@/components/ui/switch';

interface CourseFormProps {
  course?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CourseForm({ course, isOpen, onClose, onSuccess }: CourseFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [imageText, setImageText] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [isLocked, setIsLocked] = useState(false);

  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const { toast } = useToast();
  const { data: communities = [] } = useOwnedCommunities();

  // Converter arquivo para base64
  const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        const mimeType = file.type || 'image/png';
        resolve({ data: base64, mimeType });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setDescription(course.description || '');
      setCommunityId(course.community_id || '');
      setImageText(course.image_text || '');
      setCoverImageUrl(course.cover_image_url || '');
      setIsLocked(course.is_locked || false);
      
      // Mostrar preview de capa (prioriza data, depois url)
      if (course.cover_image_data) {
        setCoverImagePreview(`data:${course.cover_image_mime_type || 'image/png'};base64,${course.cover_image_data}`);
      } else {
        setCoverImagePreview(course.cover_image_url || '');
      }
    } else {
      setTitle('');
      setDescription('');
      setCommunityId('');
      setImageText('');
      setCoverImageUrl('');
      setCoverImageFile(null);
      setCoverImagePreview('');
      setIsLocked(false);
    }
  }, [course, isOpen]);

  const handleCoverImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setCoverImageFile(file);
      setCoverImageUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview('');
    setCoverImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Converter arquivo para base64 se houver
      let coverImageData: string | null | undefined;
      let coverImageMimeType: string | null | undefined;
      let finalCoverImageUrl: string | null | undefined = coverImageUrl.trim() || null;

      // Se não tem preview e não tem URL, limpar dados do banco
      if (!coverImagePreview && !coverImageUrl.trim()) {
        coverImageData = null;
        coverImageMimeType = null;
        finalCoverImageUrl = null;
      } else if (coverImageFile) {
        try {
          const { data, mimeType } = await fileToBase64(coverImageFile);
          coverImageData = data;
          coverImageMimeType = mimeType;
          // Limpar URL se tiver arquivo
          finalCoverImageUrl = null;
        } catch (error) {
          toast({
            title: 'Erro',
            description: 'Não foi possível processar o arquivo da imagem',
            variant: 'destructive',
          });
          return;
        }
      } else if (coverImageUrl.trim()) {
        // Se tem URL mas não tem arquivo novo, manter URL e limpar data
        coverImageData = null;
        coverImageMimeType = null;
      }

      const courseData: any = {
        title: title.trim(),
        description: description.trim() || null,
        community_id: communityId || null,
        image_text: imageText.trim() || null,
        is_locked: isLocked,
      };

      // Incluir campos de imagem apenas se foram definidos
      if (coverImageData !== undefined) courseData.cover_image_data = coverImageData;
      if (coverImageMimeType !== undefined) courseData.cover_image_mime_type = coverImageMimeType;
      if (finalCoverImageUrl !== undefined) courseData.cover_image_url = finalCoverImageUrl;

      if (course) {
        await updateMutation.mutateAsync({ id: course.id, ...courseData });
        toast({
          title: 'Curso atualizado!',
          description: 'As alterações foram salvas com sucesso',
        });
      } else {
        await createMutation.mutateAsync(courseData);
        toast({
          title: 'Curso criado!',
          description: 'O curso foi criado com sucesso',
        });
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o curso',
        variant: 'destructive',
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? 'Editar Curso' : 'Criar Novo Curso'}</DialogTitle>
          <DialogDescription>
            {course ? 'Atualize as informações do curso' : 'Preencha os dados para criar um novo curso'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: PROMPT$"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do curso"
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="community_id">Comunidade</Label>
              <select
                id="community_id"
                value={communityId}
                onChange={(e) => setCommunityId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="">Selecione uma comunidade</option>
                {communities.map((comm) => (
                  <option key={comm.id} value={comm.id}>
                    {comm.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_text">Texto da Capa</Label>
              <Input
                id="image_text"
                value={imageText}
                onChange={(e) => setImageText(e.target.value)}
                placeholder="Ex: PROMPT$"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="is_locked" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Curso Bloqueado
                </Label>
                <p className="text-sm text-muted-foreground">
                  Quando bloqueado, o curso requer compra ou convite para acesso
                </p>
              </div>
              <Switch
                id="is_locked"
                checked={isLocked}
                onCheckedChange={setIsLocked}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">Imagem de Capa</Label>
            <div className="space-y-2">
              {coverImagePreview ? (
                <div className="relative inline-block">
                  <img 
                    src={coverImagePreview} 
                    alt="Cover preview" 
                    className="h-32 w-full max-w-md rounded-lg object-cover border-2 border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={removeCoverImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="coverImageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('coverImageFile')?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Imagem
                  </Button>
                  <span className="text-sm text-muted-foreground">ou</span>
            <Input
              id="cover_image_url"
                    value={coverImageUrl}
                    onChange={(e) => {
                      setCoverImageUrl(e.target.value);
                      setCoverImageFile(null);
                      setCoverImagePreview('');
                    }}
                    placeholder="Cole a URL da imagem"
              type="url"
                    className="flex-1"
              disabled={isLoading}
            />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                course ? 'Salvar Alterações' : 'Criar Curso'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

