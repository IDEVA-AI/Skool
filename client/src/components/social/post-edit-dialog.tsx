import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TipTapEditor } from '@/components/tiptap-editor';
import { useState, useEffect } from 'react';
import { useUpdatePost } from '@/hooks/use-posts';
import { useToast } from '@/hooks/use-toast';
import { Post } from '@/lib/permissions';

interface PostEditDialogProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostEditDialog({ post, isOpen, onClose }: PostEditDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const updatePostMutation = useUpdatePost();
  const { toast } = useToast();

  // Atualizar valores quando o post mudar
  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
    }
  }, [post]);

  // Função para verificar se o conteúdo HTML está vazio
  const isContentEmpty = (html: string): boolean => {
    if (!html || !html.trim()) return true;
    // Remove tags HTML e verifica se sobra apenas espaços em branco
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    return textContent.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !title.trim() || isContentEmpty(content)) return;

    try {
      await updatePostMutation.mutateAsync({
        postId: post.id,
        title: title.trim(),
        content: content.trim(),
      });

      toast({
        title: 'Post atualizado!',
        description: 'Seu post foi atualizado com sucesso',
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível atualizar o post',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    if (!updatePostMutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Post</DialogTitle>
          <DialogDescription>
            Faça as alterações desejadas no seu post
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do post"
                required
                disabled={updatePostMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Conteúdo</Label>
              <TipTapEditor
                value={content}
                onChange={setContent}
                placeholder="Escreva o conteúdo do post..."
                className="min-h-[300px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updatePostMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updatePostMutation.isPending || !title.trim() || isContentEmpty(content)}
            >
              {updatePostMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

