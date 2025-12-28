import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from '@/hooks/use-announcements';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AnnouncementFormProps {
  announcement?: any;
  mode?: 'create' | 'edit';
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AnnouncementForm({ 
  announcement, 
  mode = 'create', 
  trigger,
  isOpen: controlledOpen,
  onClose,
}: AnnouncementFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(value);
    } else if (onClose && !value) {
      onClose();
    }
  };
  const [title, setTitle] = useState(announcement?.title || '');
  const [content, setContent] = useState(announcement?.content || '');
  const [imageUrl, setImageUrl] = useState(announcement?.image_url || '');
  const [buttonText, setButtonText] = useState(announcement?.button_text || 'Saiba mais');
  const [buttonUrl, setButtonUrl] = useState(announcement?.button_url || '');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const { toast } = useToast();

  // Atualizar campos quando o aviso mudar ou o dialog abrir
  useEffect(() => {
    if (open && announcement) {
      setTitle(announcement.title || '');
      setContent(announcement.content || '');
      setImageUrl(announcement.image_url || '');
      setButtonText(announcement.button_text || 'Saiba mais');
      setButtonUrl(announcement.button_url || '');
    } else if (open && mode === 'create') {
      // Resetar campos ao criar novo
      setTitle('');
      setContent('');
      setImageUrl('');
      setButtonText('Saiba mais');
      setButtonUrl('');
    }
  }, [open, announcement, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({ 
          title, 
          content, 
          imageUrl: imageUrl || undefined,
          buttonText: buttonText || undefined,
          buttonUrl: buttonUrl || undefined,
        });
        toast({
          title: 'Aviso criado!',
          description: 'O aviso foi publicado com sucesso',
        });
      } else {
        await updateMutation.mutateAsync({ 
          id: announcement.id, 
          title, 
          content, 
          imageUrl: imageUrl || null,
          buttonText: buttonText || null,
          buttonUrl: buttonUrl || null,
        });
        toast({
          title: 'Aviso atualizado!',
          description: 'As alterações foram salvas',
        });
      }
      
      setTitle('');
      setContent('');
      setImageUrl('');
      setButtonText('Saiba mais');
      setButtonUrl('');
      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o aviso',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(announcement.id);
      toast({
        title: 'Aviso deletado',
        description: 'O aviso foi removido com sucesso',
      });
      setDeleteDialogOpen(false);
      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível deletar o aviso',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger && (
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
        )}
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Criar Aviso' : 'Editar Aviso'}</DialogTitle>
            <DialogDescription>
              {mode === 'create' 
                ? 'Crie um novo aviso para a comunidade'
                : 'Edite as informações do aviso'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do aviso"
                required
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Conteúdo do aviso"
                rows={5}
                required
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonText">Texto do Botão (opcional)</Label>
              <Input
                id="buttonText"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Saiba mais"
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonUrl">URL do Botão (opcional)</Label>
              <Input
                id="buttonUrl"
                type="url"
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                placeholder="https://exemplo.com ou /caminho"
                disabled={createMutation.isPending || updateMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Pode ser um link externo (https://) ou interno (/caminho)
              </p>
            </div>
            <div className="flex items-center justify-between pt-4">
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deletando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar
                    </>
                  )}
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    mode === 'create' ? 'Criar' : 'Salvar'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este aviso? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

