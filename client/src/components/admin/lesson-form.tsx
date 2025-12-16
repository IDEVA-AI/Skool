import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateLesson, useUpdateLesson } from '@/hooks/use-admin-modules-lessons';
import { useStorageUpload } from '@/hooks/use-storage-upload';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

interface LessonFormProps {
  moduleId: number;
  lesson?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LessonForm({ moduleId, lesson, isOpen, onClose, onSuccess }: LessonFormProps) {
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<'video' | 'pdf' | 'text'>('video');
  const [contentUrl, setContentUrl] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [order, setOrder] = useState<number>(0);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');

  const createMutation = useCreateLesson();
  const updateMutation = useUpdateLesson();
  const { uploadFile: uploadToStorage, uploading } = useStorageUpload();
  const { toast } = useToast();

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '');
      setContentType(lesson.content_type || 'video');
      setContentUrl(lesson.content_url || '');
      setDuration(lesson.duration || 0);
      setOrder(lesson.order || 0);
    } else {
      setTitle('');
      setContentType('video');
      setContentUrl('');
      setDuration(0);
      setOrder(0);
      setUploadFile(null);
      setUploadPreview('');
    }
  }, [lesson, isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (50MB)
    if (file.size > 52428800) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 50MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadFile(file);
    
    // Preview para vídeo
    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setUploadPreview(url);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    const fileType = uploadFile.type.startsWith('video/') ? 'video' : 
                     uploadFile.type === 'application/pdf' ? 'pdf' : 'text';
    
    setContentType(fileType);

    const url = await uploadToStorage(uploadFile, `lessons/${moduleId}`);
    if (url) {
      setContentUrl(url);
      setUploadFile(null);
      setUploadPreview('');
      toast({
        title: 'Upload concluído!',
        description: 'Arquivo enviado com sucesso',
      });
    }
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
      const lessonData = {
        title: title.trim(),
        content_type: contentType,
        content_url: contentUrl || null,
        duration: duration || null,
        order: order || undefined,
      };

      if (lesson) {
        await updateMutation.mutateAsync({
          id: lesson.id,
          ...lessonData,
        });
        toast({
          title: 'Aula atualizada!',
          description: 'As alterações foram salvas',
        });
      } else {
        await createMutation.mutateAsync({
          module_id: moduleId,
          ...lessonData,
        });
        toast({
          title: 'Aula criada!',
          description: 'A aula foi criada com sucesso',
        });
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a aula',
        variant: 'destructive',
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lesson ? 'Editar Aula' : 'Criar Nova Aula'}</DialogTitle>
          <DialogDescription>
            {lesson ? 'Atualize as informações da aula' : 'Crie uma nova aula para o módulo'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Introdução ao Tópico"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="content_type">Tipo de Conteúdo</Label>
              <select
                id="content_type"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as 'video' | 'pdf' | 'text')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                <option value="video">Vídeo</option>
                <option value="pdf">PDF</option>
                <option value="text">Texto</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (segundos)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                placeholder="600"
                min="0"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-2">
            <Label>Upload de Arquivo</Label>
            {uploadFile ? (
              <div className="border border-border rounded-md p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{uploadFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setUploadFile(null);
                      setUploadPreview('');
                    }}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {uploadPreview && (
                  <video src={uploadPreview} controls className="w-full max-h-48 rounded" />
                )}
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Fazer Upload
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                <Input
                  type="file"
                  accept="video/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading}
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para fazer upload ou arraste o arquivo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vídeo ou PDF (máx. 50MB)
                  </p>
                </Label>
              </div>
            )}
          </div>

          {/* URL Externa (alternativa ao upload) */}
          <div className="space-y-2">
            <Label htmlFor="content_url">URL Externa (alternativa)</Label>
            <Input
              id="content_url"
              type="url"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://exemplo.com/video.mp4 ou https://youtube.com/watch?v=..."
              disabled={isLoading || !!uploadFile}
            />
            <p className="text-xs text-muted-foreground">
              Use esta opção se preferir hospedar o conteúdo externamente (YouTube, Vimeo, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Ordem</Label>
            <Input
              id="order"
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
              disabled={isLoading}
            />
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
              disabled={isLoading || uploading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                lesson ? 'Salvar Alterações' : 'Criar Aula'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

