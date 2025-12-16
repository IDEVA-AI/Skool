import { MoreHorizontal, Edit, Trash2, Shield, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { useUpdatePost, useDeletePost, usePinPost, useUnpinPost } from '@/hooks/use-posts';
import { useToast } from '@/hooks/use-toast';
import { can, type Post } from '@/lib/permissions';
import { useState } from 'react';
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

interface PostActionsMenuProps {
  post: Post;
  onEdit?: (post: Post) => void;
  className?: string;
}

export function PostActionsMenu({ post, onEdit, className }: PostActionsMenuProps) {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();
  const pinPostMutation = usePinPost();
  const unpinPostMutation = useUnpinPost();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const canUpdate = can(user, userRole || null, 'update', post);
  const canDelete = can(user, userRole || null, 'delete', post);
  const canModerate = can(user, userRole || null, 'moderate', post);
  const isAdmin = userRole === 'admin';
  const isPinned = post.pinned === true;

  // Se não há permissões, não renderiza o menu
  if (!canUpdate && !canDelete && !canModerate) {
    return null;
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePostMutation.mutateAsync({ postId: post.id });
      toast({
        title: 'Post deletado',
        description: 'O post foi removido com sucesso',
      });
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao deletar',
        description: error.message || 'Não foi possível deletar o post',
        variant: 'destructive',
      });
    }
  };

  const handlePin = async () => {
    try {
      if (isPinned) {
        await unpinPostMutation.mutateAsync({ postId: post.id });
        toast({
          title: 'Post desafixado',
          description: 'O post foi removido dos fixados',
        });
      } else {
        await pinPostMutation.mutateAsync({ postId: post.id });
        toast({
          title: 'Post fixado',
          description: 'O post foi fixado no topo do feed',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar fixação',
        description: error.message || 'Não foi possível alterar a fixação do post',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 text-muted-foreground hover:text-foreground ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Ações do usuário regular */}
          {(canUpdate || canDelete) && !isAdmin && (
            <>
              <DropdownMenuGroup>
                {canUpdate && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </>
          )}

          {/* Ações de admin (visualmente agrupadas) */}
          {isAdmin && (
            <>
              {!canUpdate && !canDelete && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Moderação
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                {canModerate && (
                  <DropdownMenuItem 
                    onClick={handlePin}
                    disabled={pinPostMutation.isPending || unpinPostMutation.isPending}
                  >
                    {isPinned ? (
                      <>
                        <PinOff className="h-4 w-4 mr-2" />
                        Desafixar Post
                      </>
                    ) : (
                      <>
                        <Pin className="h-4 w-4 mr-2" />
                        Fixar Post
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {canUpdate && (
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Post
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar Post
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar post?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O post será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

