import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateModule, useUpdateModule } from '@/hooks/use-admin-modules-lessons';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ModuleFormProps {
  courseId: number;
  module?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ModuleForm({ courseId, module, isOpen, onClose, onSuccess }: ModuleFormProps) {
  const [title, setTitle] = useState('');

  const createMutation = useCreateModule();
  const updateMutation = useUpdateModule();
  const { toast } = useToast();

  useEffect(() => {
    if (module) {
      setTitle(module.title || '');
    } else {
      setTitle('');
    }
  }, [module, isOpen]);

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
      if (module) {
        await updateMutation.mutateAsync({
          id: module.id,
          title: title.trim(),
        });
        toast({
          title: 'Módulo atualizado!',
          description: 'As alterações foram salvas',
        });
      } else {
        await createMutation.mutateAsync({
          course_id: courseId,
          title: title.trim(),
        });
        toast({
          title: 'Módulo criado!',
          description: 'O módulo foi criado com sucesso',
        });
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o módulo',
        variant: 'destructive',
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{module ? 'Editar Módulo' : 'Criar Novo Módulo'}</DialogTitle>
          <DialogDescription>
            {module ? 'Atualize as informações do módulo' : 'Crie um novo módulo para o curso'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Módulo 1: Introdução"
              required
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                module ? 'Salvar Alterações' : 'Criar Módulo'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

