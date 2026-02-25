import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Post } from '@/types/social';
import { cn } from '@/lib/utils';

interface ActivityIndicatorProps {
  post: Post;
  className?: string;
}

export function ActivityIndicator({ post, className }: ActivityIndicatorProps) {
  const hasReactions = post.reactions && post.reactions.length > 0;
  const hasComments = post.commentCount > 0;
  const hasActivity = hasReactions || hasComments || post.lastActivityAt;

  if (!hasActivity) {
    return null;
  }

  const displayAvatars = post.recentAvatars || [];

  if (displayAvatars.length === 0 && post.comments && post.comments.length > 0) {
    const lastComment = post.comments[post.comments.length - 1];
    if (lastComment.authorAvatar) {
      displayAvatars.push(lastComment.authorAvatar);
    }
  }

  const totalReactions = post.reactions?.length || 0;
  const totalComments = post.commentCount || 0;

  return (
    <div className={cn('flex items-center gap-2 text-[11px] text-muted-foreground/40', className)}>
      {/* Stacked avatars */}
      {displayAvatars.length > 0 && (
        <div className="flex items-center -space-x-1.5">
          {displayAvatars.slice(0, 3).map((avatar, index) => (
            <Avatar
              key={index}
              className="h-5 w-5 border border-background"
            >
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-[8px]">U</AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}

      {totalReactions > 0 && (
        <span>
          {totalReactions} {totalReactions === 1 ? 'curtida' : 'curtidas'}
        </span>
      )}

      {totalReactions > 0 && totalComments > 0 && (
        <span className="text-muted-foreground/20">&middot;</span>
      )}

      {totalComments > 0 && (
        <span>
          {totalComments} {totalComments === 1 ? 'comentario' : 'comentarios'}
        </span>
      )}
    </div>
  );
}
