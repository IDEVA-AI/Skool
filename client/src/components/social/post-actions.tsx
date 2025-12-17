import { MessageSquare, Share2, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { ReactionButton } from './reaction-button';
import { useReactions } from '@/hooks/use-reactions';
import { ReactionType } from '@/types/social';
import { useSavePost, useUnsavePost, useSavedPostIds } from '@/hooks/use-saved-posts';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { shareContent, getPostUrl } from '@/lib/share';
import { useSelectedCommunity } from '@/contexts/community-context';

interface PostActionsProps {
  postId: string;
  reactions?: Array<{ id: string; type: ReactionType; userId: string; userName: string }>;
  commentCount: number;
  currentUserId: string;
  currentUserName: string;
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
  currentUserId,
  currentUserName,
  onCommentClick,
  onShareClick,
  onReactionChange,
  className,
  postTitle,
}: PostActionsProps) {
  const { toast } = useToast();
  const { communitySlug } = useSelectedCommunity();
  const postIdNum = parseInt(postId) || 0;
  const savedPostIds = useSavedPostIds();
  const isSaved = savedPostIds.includes(postIdNum);
  const savePostMutation = useSavePost();
  const unsavePostMutation = useUnsavePost();

  const { reactions: updatedReactions, reactionCounts, userReaction, toggleReaction } = useReactions({
    initialReactions: reactions,
    currentUserId,
    currentUserName,
  });

  // Sync reactions changes with parent (for API integration)
  useEffect(() => {
    if (!onReactionChange) return;
    
    // Compare reactions arrays
    const hasChanges = 
      updatedReactions.length !== reactions.length ||
      updatedReactions.some((r, i) => {
        const oldR = reactions[i];
        return !oldR || r.type !== oldR.type || r.userId !== oldR.userId;
      }) ||
      reactions.some((r, i) => {
        const newR = updatedReactions[i];
        return !newR || r.type !== newR.type || r.userId !== newR.userId;
      });
    
    if (hasChanges) {
      onReactionChange(updatedReactions);
    }
  }, [updatedReactions, reactions, onReactionChange]);

  const handleReaction = (type: ReactionType) => {
    toggleReaction(type);
  };

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
    <div className={className}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <ReactionButton
            type="like"
            count={reactionCounts.like}
            isActive={userReaction === 'like'}
            onClick={() => handleReaction('like')}
          />
          <ReactionButton
            type="love"
            count={reactionCounts.love}
            isActive={userReaction === 'love'}
            onClick={() => handleReaction('love')}
          />
          <ReactionButton
            type="laugh"
            count={reactionCounts.laugh}
            isActive={userReaction === 'laugh'}
            onClick={() => handleReaction('laugh')}
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onCommentClick}
          className="gap-2 h-8 px-2 text-muted-foreground hover:text-primary"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-medium">{commentCount}</span>
          <span className="text-sm font-medium hidden sm:inline">Comentários</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveToggle}
          disabled={savePostMutation.isPending || unsavePostMutation.isPending}
          className={cn(
            "gap-2 h-8 px-2",
            isSaved 
              ? "text-primary hover:text-primary" 
              : "text-muted-foreground hover:text-primary"
          )}
        >
          {savePostMutation.isPending || unsavePostMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSaved ? (
            <BookmarkCheck className="h-4 w-4 fill-current" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          <span className="text-sm font-medium hidden sm:inline">
            {isSaved ? 'Salvo' : 'Salvar'}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="gap-2 h-8 px-2 text-muted-foreground hover:text-primary"
        >
          <Share2 className="h-4 w-4" />
          <span className="text-sm font-medium hidden sm:inline">Compartilhar</span>
        </Button>
      </div>
    </div>
  );
}

