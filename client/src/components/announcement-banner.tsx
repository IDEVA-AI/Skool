import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnnouncementForm } from '@/components/announcement-form';
import { useDeleteAnnouncement } from '@/hooks/use-announcements';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface AnnouncementBannerProps {
  announcement: any | null | undefined;
  isAdmin?: boolean;
  className?: string;
}

export function AnnouncementBanner({
  announcement,
  isAdmin = false,
  className,
}: AnnouncementBannerProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteMutation = useDeleteAnnouncement();
  const { toast } = useToast();

  // Verificar se announcement existe antes de desestruturar
  if (!announcement) {
    return null;
  }

  const { 
    title = '', 
    content = '', 
    image_url: imageUrl = null, 
    button_text: buttonText = null, 
    button_url: buttonUrl = null 
  } = announcement || {};

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(announcement.id);
      toast({
        title: 'Aviso deletado',
        description: 'O aviso foi removido com sucesso',
      });
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível deletar o aviso',
        variant: 'destructive',
      });
    }
  };
  const handleButtonClick = () => {
    if (buttonUrl) {
      // Verificar se é um link externo ou interno
      if (buttonUrl.startsWith('http://') || buttonUrl.startsWith('https://')) {
        window.open(buttonUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = buttonUrl;
      }
    }
  };

  return (
    <>
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border-2 border-primary/20',
          'bg-gradient-to-br from-primary/5 via-background to-primary/5',
          'shadow-lg hover:shadow-xl transition-all duration-300',
          className
        )}
      >
        {/* Botões de ação (admin) */}
        {isAdmin && (
          <div className="absolute top-4 right-4 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="flex flex-col md:flex-row">
        {/* Imagem à esquerda */}
        {imageUrl && (
          <div className="relative w-full md:w-2/5 h-48 md:h-auto min-h-[150px] overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent md:hidden" />
          </div>
        )}

        {/* Conteúdo à direita */}
        <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Título */}
            <h3 className="text-lg md:text-xl font-bold leading-tight text-foreground">
              {title}
            </h3>

            {/* Descrição */}
            <p className="text-muted-foreground leading-relaxed text-sm">
              {content}
            </p>
          </div>

          {/* Botão de ação */}
          {buttonText && buttonUrl && (
            <div className="mt-6">
              <Button
                onClick={handleButtonClick}
                size="lg"
                className="w-full md:w-auto min-w-[160px] group"
              >
                {buttonText}
                <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          )}
        </div>
        </div>

        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-10" />
      </div>

      {/* Dialog de edição */}
      {editDialogOpen && (
        <AnnouncementForm
          announcement={announcement}
          mode="edit"
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
        />
      )}

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

