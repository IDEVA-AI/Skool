import { useState, useCallback } from 'react';
import { MessageSquare, Share2, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactionBar } from './reaction-bar';
import { useTogglePostReaction, getReactionState } from '@/hooks/use-reactions';
import { Reaction, ReactionType } from '@/types/social';
import { useSavePost, useUnsavePost, useSavedPostIds } from '@/hooks/use-saved-posts';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { shareContent, getPostUrl } from '@/lib/share';
import { useSelectedCommunity } from '@/contexts/community-context';
import { useSocialContextSafe } from './social-context';

interface PostActionsProps {
  postId: string;
  reactions?: Reaction[];
  commentCount: number;
  currentUserId?: string;
  currentUserName?: string;
  onCommentClick?: () => void;
  onShareClick?: () => void;
  className?: string;
  postTitle?: string;
}

export function PostActions({
  postId,
  reactions: initialReactions = [],
  commentCount,
  currentUserId: propUserId,
  onCommentClick,
  onShareClick,
  className,
  postTitle,
}: PostActionsProps) {
  const { toast } = useToast();
  const { communitySlug } = useSelectedCommunity();
  const socialContext = useSocialContextSafe();
  const toggleMutation = useTogglePostReaction();

  const currentUserId = propUserId || socialContext?.currentUser?.id || '';

  const postIdNum = parseInt(postId) || 0;
  const savedPostIds = useSavedPostIds();
  const isSaved = savedPostIds.includes(postIdNum);
  const savePostMutation = useSavePost();
  const unsavePostMutation = useUnsavePost();

  // Local optimistic state for reactions
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);

  const { userReaction } = getReactionState(reactions, currentUserId);

  const handleReact = useCallback((type: ReactionType) => {
    // Optimistic update
    setReactions(prev => {
      const existingIdx = prev.findIndex(r => r.userId === currentUserId);
      if (existingIdx >= 0) {
        if (prev[existingIdx].type === type) {
          return prev.filter(r => r.userId !== currentUserId);
        } else {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], type };
          return updated;
        }
      } else {
        return [...prev, { id: `temp-${Date.now()}`, type, userId: currentUserId, userName: '' }];
      }
    });

    // Persist to DB
    toggleMutation.mutate({ postId: postIdNum, reactionType: type });
  }, [currentUserId, postIdNum, toggleMutation]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getPostUrl(postId, communitySlug || undefined);
    const result = await shareContent({
      title: postTitle || 'Confira este post',
      text: 'Veja este post interessante!',
      url,
    });

    if (result.success && result.method === 'clipboard') {
      toast({ title: 'Link copiado!', description: 'O link foi copiado para a area de transferencia' });
    } else if (!result.success) {
      toast({ title: 'Erro ao compartilhar', description: 'Nao foi possivel compartilhar o conteudo', variant: 'destructive' });
    }
    onShareClick?.();
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isSaved) {
        await unsavePostMutation.mutateAsync(postIdNum);
        toast({ title: 'Post removido', description: 'O post foi removido dos seus salvos' });
      } else {
        await savePostMutation.mutateAsync(postIdNum);
        toast({ title: 'Post salvo', description: 'O post foi salvo com sucesso' });
      }
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message || 'Nao foi possivel salvar o post', variant: 'destructive' });
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <ReactionBar
        reactions={reactions}
        userReaction={userReaction}
        onReact={handleReact}
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={onCommentClick}
        className="gap-1.5 h-7 px-2.5 rounded-full text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 text-xs"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="tabular-nums">{commentCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSaveToggle}
        disabled={savePostMutation.isPending || unsavePostMutation.isPending}
        className={cn(
          'h-7 w-7 p-0 rounded-full transition-all duration-200',
          isSaved
            ? 'text-foreground'
            : 'text-muted-foreground/40 hover:text-foreground hover:bg-muted/60'
        )}
      >
        {savePostMutation.isPending || unsavePostMutation.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isSaved ? (
          <BookmarkCheck className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="h-7 w-7 p-0 rounded-full text-muted-foreground/40 hover:text-foreground hover:bg-muted/60"
      >
        <Share2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
