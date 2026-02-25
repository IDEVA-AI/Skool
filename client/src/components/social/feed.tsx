import { useMemo, memo } from 'react';
import { Post as PostType } from '@/types/social';
import { PostComponent } from './post';
import { PostComposerSimple } from './post-composer-simple';
import { useSocialContextSafe } from './social-context';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/use-user-role';
import { can } from '@/lib/permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import type { PollData } from './post-composer-simple';

interface FeedProps {
  posts: PostType[];
  isLoading?: boolean;
  onPostCreate?: (title: string, content: string, poll?: PollData) => Promise<void>;
  onCommentAdd?: (postId: string, content: string, parentId?: string) => void;
  onShare?: (postId: string) => void;
  onPostClick?: (post: PostType) => void;
  context?: string;
  contextHighlight?: string;
  className?: string;
}

function Feed({
  posts,
  isLoading = false,
  onPostCreate,
  onCommentAdd,
  onShare,
  onPostClick,
  context,
  contextHighlight,
  className,
}: FeedProps) {
  const { user } = useAuth();
  const { data: userRole } = useUserRole();
  const socialContext = useSocialContextSafe();

  const canCreate = socialContext?.permissions.canCreate ?? can(user, userRole || null, 'create');

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }, [posts]);

  const currentUser = socialContext?.currentUser ?? (user ? {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || user.email || 'U')}`,
  } : null);

  if (isLoading) {
    return (
      <div className={cn('space-y-1', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-8 px-5 border-b border-border/30">
            <div className="flex items-center gap-3 mb-5">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-2.5 w-14 rounded" />
              </div>
            </div>
            <Skeleton className="h-6 w-3/4 mb-3 rounded" />
            <Skeleton className="h-4 w-full mb-2 rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Post Composer */}
      {canCreate && currentUser && onPostCreate && (
        <div className="mb-2">
          <PostComposerSimple
            avatar={currentUser.avatar}
            name={currentUser.name}
            context={context}
            contextHighlight={contextHighlight}
            onPublish={onPostCreate}
            isPublishing={false}
          />
        </div>
      )}

      {/* Posts */}
      {sortedPosts.length > 0 ? (
        <div className="divide-y divide-border/30">
          {sortedPosts.map((post, index) => (
            <div
              key={post.id}
              className="feed-item-animate"
              style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
            >
              <PostComponent
                post={{
                  ...post,
                  createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt),
                }}
                onCommentAdd={onCommentAdd}
                onShare={onShare}
                onPostClick={onPostClick}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center feed-item-animate">
          <p className="text-2xl font-semibold text-zinc-400 mb-2">
            Nenhuma publicacao ainda
          </p>
          <p className="text-sm text-zinc-400">
            Seja o primeiro a compartilhar algo!
          </p>
        </div>
      )}
    </div>
  );
}

Feed.displayName = 'Feed';

const FeedMemo = memo(Feed);
FeedMemo.displayName = 'Feed';

export { FeedMemo as Feed };
