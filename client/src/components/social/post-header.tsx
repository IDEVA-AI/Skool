import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pin, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Post } from '@/types/social';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import { useSelectedCommunity } from '@/contexts/community-context';

interface PostHeaderProps {
  post: Post;
  className?: string;
}

export function PostHeader({ post, className }: PostHeaderProps) {
  const [, setLocation] = useLocation();
  const { communitySlug } = useSelectedCommunity();

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const basePath = communitySlug ? `/c/${communitySlug}` : '';
    setLocation(`${basePath}/members/${post.authorId}`);
  };

  const initials = post.authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const role = post.authorRole || 'user';
  const isAdmin = role === 'admin';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar
        className={cn(
          'h-9 w-9 shrink-0 transition-all cursor-pointer hover:opacity-80',
          isAdmin
            ? 'ring-[1.5px] ring-offset-2 ring-offset-background ring-foreground/30'
            : ''
        )}
        onClick={handleAuthorClick}
      >
        <AvatarImage src={post.authorAvatar} alt={post.authorName} />
        <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-[13px] font-semibold text-foreground tracking-[-0.01em] cursor-pointer hover:underline"
            onClick={handleAuthorClick}
          >
            {post.authorName}
          </span>

          {isAdmin && (
            <Shield className="h-3 w-3 text-muted-foreground/60" />
          )}

          {post.pinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase text-muted-foreground/50">
              <Pin className="h-2.5 w-2.5 fill-current" />
              Fixado
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <time className="text-[11px] text-zinc-400">
            {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ptBR })}
          </time>
          {post.category && (
            <>
              <span className="text-[11px] text-zinc-300">/</span>
              <span className="text-[11px] text-zinc-400">{post.category}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
