import { useMemo, memo } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { Post as PostType } from '@/types/social';
import { PostComponent } from './post';
import { PostComposerSimple } from './post-composer-simple';
import { useSocialContextSafe } from './social-context';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { can } from '@/lib/permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FeedProps {
  posts: PostType[];
  isLoading?: boolean;
  onPostCreate?: (title: string, content: string) => Promise<void>;
  onCommentAdd?: (postId: string, content: string, parentId?: string) => void;
  onReactionChange?: (postId: string, reactions: Array<{ id: string; type: any; userId: string; userName: string }>) => void;
  onShare?: (postId: string) => void;
  onPostClick?: (post: PostType) => void;
  context?: string;
  contextHighlight?: string;
  className?: string;
}

/**
 * Feed - Container principal do feed social
 * 
 * Usa SocialContext quando disponível para dados do usuário.
 */
function Feed({
  posts,
  isLoading = false,
  onPostCreate,
  onCommentAdd,
  onReactionChange,
  onShare,
  onPostClick,
  context,
  contextHighlight,
  className,
}: FeedProps) {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const socialContext = useSocialContextSafe();

  // Verificar permissões
  const canCreate = socialContext?.permissions.canCreate ?? can(user, userRole || null, 'create');

  // Ordenar posts: pinned primeiro, depois por data
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }, [posts]);

  // Dados do usuário (do contexto ou fallback)
  const currentUser = socialContext?.currentUser ?? (user ? {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || user.email || 'U')}`,
  } : null);

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Post Composer */}
      {canCreate && currentUser && onPostCreate && (
        <PostComposerSimple
          avatar={currentUser.avatar}
          name={currentUser.name}
          context={context}
          contextHighlight={contextHighlight}
          onPublish={onPostCreate}
          isPublishing={false}
        />
      )}

      {/* Posts */}
      {sortedPosts.length > 0 ? (
        sortedPosts.map((post) => (
          <PostComponent
            key={post.id}
            post={{
              ...post,
              createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt),
            }}
            onCommentAdd={onCommentAdd}
            onReactionChange={onReactionChange}
            onShare={onShare}
            onPostClick={onPostClick}
          />
        ))
      ) : (
        <Card className="border-border/50 border-dashed">
          <CardContent className="py-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted/50">
              <MessageSquarePlus className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Nenhum post ainda</p>
              <p className="text-sm text-muted-foreground">
                Seja o primeiro a compartilhar algo!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

Feed.displayName = 'Feed';

const FeedMemo = memo(Feed);
FeedMemo.displayName = 'Feed';

export { FeedMemo as Feed };
