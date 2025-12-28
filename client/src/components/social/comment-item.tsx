import { useState, useEffect, memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronDown, ChevronUp, Edit, Trash2, X, Check, MoreHorizontal } from 'lucide-react';
import { Comment } from '@/types/social';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReactionBar } from './reaction-bar';
import { useReactions } from '@/hooks/use-reactions';
import { ReactionType } from '@/types/social';
import { CommentList } from './comment-list';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateComment, useDeleteComment } from '@/hooks/use-forum';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { canComment, Comment as CommentPermission } from '@/lib/permissions';
import { useSocialContextSafe } from './social-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  currentUserName?: string;
  depth?: number;
  maxDepth?: number;
  onReply: (content: string, parentId: string) => void;
  onReplyClick?: (commentId: string, authorName: string) => void;
  onReactionChange?: (commentId: string, reactions: Array<{ id: string; type: ReactionType; userId: string; userName: string }>) => void;
}

function CommentItem({
  comment,
  currentUserId: propUserId,
  currentUserName: propUserName,
  depth = 0,
  maxDepth = 10,
  onReply,
  onReplyClick,
  onReactionChange,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const socialContext = useSocialContextSafe();

  // Usar contexto se disponível, senão usar props (compatibilidade)
  const currentUserId = propUserId || socialContext?.currentUser?.id || '';
  const currentUserName = propUserName || socialContext?.currentUser?.name || 'Usuário';

  // Verificar permissões
  const commentForPermission: CommentPermission = {
    id: comment.id,
    authorId: comment.authorId,
    content: comment.content,
    createdAt: comment.createdAt,
  };

  const canUpdate = canComment(user, userRole || null, 'update', commentForPermission);
  const canDelete = canComment(user, userRole || null, 'delete', commentForPermission);
  const showMenu = canUpdate || canDelete;
  
  const { reactions, userReaction, toggleReaction } = useReactions({
    initialReactions: comment.reactions,
    currentUserId,
    currentUserName,
  });

  // Sync reactions changes with parent
  useEffect(() => {
    if (!onReactionChange) return;
    
    const hasChanges = 
      reactions.length !== comment.reactions.length ||
      reactions.some((r, i) => {
        const oldR = comment.reactions[i];
        return !oldR || r.type !== oldR.type || r.userId !== oldR.userId;
      });
    
    if (hasChanges) {
      onReactionChange(comment.id, reactions);
    }
  }, [reactions, comment.id, comment.reactions, onReactionChange]);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const canReply = depth < maxDepth;

  const handleReplyClick = () => {
    if (onReplyClick) {
      onReplyClick(comment.id, comment.authorName);
    }
  };

  const handleEdit = () => {
    setEditContent(comment.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    try {
      await updateCommentMutation.mutateAsync({
        commentId: parseInt(comment.id),
        content: editContent.trim(),
      });
      toast({ title: 'Comentário atualizado!' });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCommentMutation.mutateAsync({ commentId: parseInt(comment.id) });
      toast({ title: 'Comentário deletado' });
    } catch (error: any) {
      toast({
        title: 'Erro ao deletar',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    }
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    if (!isEditing) setEditContent(comment.content);
  }, [comment.content, isEditing]);

  const initials = comment.authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn(
      'space-y-2',
      depth > 0 && 'ml-6 pl-4 border-l-2 border-border/30 hover:border-primary/30 transition-colors'
    )}>
      <div className="flex gap-3 group">
        <Avatar className="h-8 w-8 ring-1 ring-border/30 shrink-0">
          <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header e Menu */}
            <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-sm text-foreground truncate">
                  {comment.authorName}
                </span>
              <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ptBR })}
                </span>
              </div>
            
              {showMenu && !isEditing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                    {canUpdate && (
                      <DropdownMenuItem onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                      onClick={() => setShowDeleteConfirm(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

          {/* Conteúdo */}
            {isEditing ? (
            <div className="mt-2 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] text-sm resize-none"
                  disabled={updateCommentMutation.isPending}
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={updateCommentMutation.isPending || !editContent.trim()}
                    className="h-7 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                  onClick={() => setIsEditing(false)}
                    disabled={updateCommentMutation.isPending}
                    className="h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
            <>
              <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed mt-1">
                {comment.content}
              </p>

              {/* Ações */}
              <div className="flex items-center gap-1 mt-2">
                <ReactionBar
                  reactions={reactions}
                  userReaction={userReaction}
                  onReact={toggleReaction}
                  compact
                />

                {canReply && (
              <Button
                variant="ghost"
                size="sm"
                    onClick={handleReplyClick}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground rounded-full"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Responder
              </Button>
            )}

            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground rounded-full"
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                        Ocultar
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                        {comment.replies?.length} resposta{comment.replies?.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            )}
          </div>
            </>
          )}

          {/* Confirmação de delete inline */}
          {showDeleteConfirm && (
            <div className="mt-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive mb-2">Deletar este comentário?</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteCommentMutation.isPending}
                  className="h-7 text-xs"
                >
                  {deleteCommentMutation.isPending ? 'Deletando...' : 'Confirmar'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Respostas */}
      {hasReplies && showReplies && (
        <CommentList
          comments={comment.replies || []}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          depth={depth + 1}
          maxDepth={maxDepth}
          onReply={onReply}
          onReplyClick={onReplyClick}
          onReactionChange={onReactionChange}
        />
      )}
    </div>
  );
}

CommentItem.displayName = 'CommentItem';

const CommentItemMemo = memo(CommentItem);
CommentItemMemo.displayName = 'CommentItem';

export { CommentItemMemo as CommentItem };
