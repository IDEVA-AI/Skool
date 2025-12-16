import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pin, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Post } from '@/types/social';
import { cn } from '@/lib/utils';

interface PostHeaderProps {
  post: Post;
  className?: string;
}

export function PostHeader({ post, className }: PostHeaderProps) {
  const initials = post.authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const role = post.authorRole || 'user';
  const isAdmin = role === 'admin';

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <Avatar className="h-10 w-10 border-2 border-background shrink-0">
        <AvatarImage src={post.authorAvatar} alt={post.authorName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-foreground text-sm">{post.authorName}</span>
          
          {/* Admin Icon - apenas para administradores */}
          {isAdmin && (
            <Shield className="h-3.5 w-3.5 text-primary" title="Administrador" />
          )}

          {/* Pin Indicator */}
          {post.pinned && (
            <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-600 dark:text-blue-400">
              <Pin className="h-3 w-3 mr-1 fill-current" />
              Fixado
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <span>{formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ptBR })}</span>
        </div>
      </div>
    </div>
  );
}

