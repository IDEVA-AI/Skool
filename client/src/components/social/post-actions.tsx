import { MessageSquare, Share2, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { ReactionBar } from './reaction-bar';
import { useReactions } from '@/hooks/use-reactions';
import { ReactionType } from '@/types/social';
import { useSavePost, useUnsavePost, useSavedPostIds } from '@/hooks/use-saved-posts';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { shareContent, getPostUrl } from '@/lib/share';
import { useSelectedCommunity } from '@/contexts/community-context';
import { useSocialContextSafe } from './social-context';

interface PostActionsProps {
  postId: string;
  reactions?: Array<{ id: string; type: ReactionType; userId: string; userName: string }>;
  commentCount: number;
  currentUserId?: string;
  currentUserName?: string;
  onCommentClick?: () => void;
  onShareClick?: () => void;
  onReactionChange?: (reactions: Array<{ id: string; type: ReactionType; userId: string; userName: string }>) => void;
  className?: string;
  postTitle?: string;
}

export function PostActions({
  postId,
  reactions = [],
  commentCount,
  currentUserId: propUserId,
  currentUserName: propUserName,
  onCommentClick,
  onShareClick,
  onReactionChange,
  className,
  postTitle,
}: PostActionsProps) {
  const { toast } = useToast();
  const { communitySlug } = useSelectedCommunity();
  const socialContext = useSocialContextSafe();
  
  // Usar contexto se disponível, senão usar props (compatibilidade)
  const currentUserId = propUserId || socialContext?.currentUser?.id || '';
  const currentUserName = propUserName || socialContext?.currentUser?.name || 'Usuário';
  
  const postIdNum = parseInt(postId) || 0;
  const savedPostIds = useSavedPostIds();
  const isSaved = savedPostIds.includes(postIdNum);
  const savePostMutation = useSavePost();
  const unsavePostMutation = useUnsavePost();

  const { reactions: updatedReactions, userReaction, toggleReaction } = useReactions({
    initialReactions: reactions,
    currentUserId,
    currentUserName,
  });

  // Sync reactions changes with parent (for API integration)
  useEffect(() => {
    if (!onReactionChange) return;
    
    const hasChanges = 
      updatedReactions.length !== reactions.length ||
      updatedReactions.some((r, i) => {
        const oldR = reactions[i];
        return !oldR || r.type !== oldR.type || r.userId !== oldR.userId;
      });
    
    if (hasChanges) {
      onReactionChange(updatedReactions);
    }
  }, [updatedReactions, reactions, onReactionChange]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const url = getPostUrl(postId, communitySlug || undefined);
    const result = await shareContent({
      title: postTitle || 'Confira este post',
      text: 'Veja este post interessante!',
      url,
    });

    if (result.success) {
      if (result.method === 'clipboard') {
        toast({
          title: 'Link copiado!',
          description: 'O link foi copiado para a área de transferência',
        });
      }
    } else {
      toast({
        title: 'Erro ao compartilhar',
        description: 'Não foi possível compartilhar o conteúdo',
        variant: 'destructive',
      });
    }

    onShareClick?.();
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (isSaved) {
        await unsavePostMutation.mutateAsync(postIdNum);
        toast({
          title: 'Post removido',
          description: 'O post foi removido dos seus salvos',
        });
      } else {
        await savePostMutation.mutateAsync(postIdNum);
        toast({
          title: 'Post salvo',
          description: 'O post foi salvo com sucesso',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar o post',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Reações unificadas */}
      <ReactionBar
        reactions={updatedReactions}
        userReaction={userReaction}
        onReact={toggleReaction}
      />

      {/* Comentários */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onCommentClick}
        className="gap-1.5 h-8 px-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80"
      >
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm font-medium tabular-nums">{commentCount}</span>
      </Button>

      {/* Salvar */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSaveToggle}
        disabled={savePostMutation.isPending || unsavePostMutation.isPending}
        className={cn(
          'gap-1.5 h-8 px-3 rounded-full transition-all duration-200',
          isSaved 
            ? 'text-primary bg-primary/10 hover:bg-primary/20' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
        )}
      >
        {savePostMutation.isPending || unsavePostMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSaved ? (
          <BookmarkCheck className="h-4 w-4 fill-current" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>

      {/* Compartilhar */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="gap-1.5 h-8 px-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
