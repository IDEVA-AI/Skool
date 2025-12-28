import { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Post } from '@/types/social';
import { PostHeader } from './post-header';
import { PostContent } from './post-content';
import { ActivityIndicator } from './activity-indicator';
import { PostActions } from './post-actions';
import { PostActionsMenu } from './post-actions-menu';
import { PostEditDialog } from './post-edit-dialog';
import { ReactionType } from '@/types/social';
import { cn } from '@/lib/utils';
import { Post as PostPermissionType } from '@/lib/permissions';
import { useSocialContextSafe } from './social-context';

interface PostProps {
  post: Post;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  onCommentAdd?: (postId: string, content: string, parentId?: string) => void;
  onReactionChange?: (postId: string, reactions: Array<{ id: string; type: ReactionType; userId: string; userName: string }>) => void;
  onShare?: (postId: string) => void;
  onPostClick?: (post: Post) => void;
  className?: string;
}

/**
 * PostComponent - Card de post para o feed
 * 
 * Otimizações:
 * - Memoizado para evitar re-renders desnecessários
 * - Usa SocialContext quando disponível (fallback para props)
 */
function PostComponent({
  post,
  currentUserId: propUserId,
  currentUserName: propUserName,
  currentUserAvatar: propUserAvatar,
  onCommentAdd,
  onReactionChange,
  onShare,
  onPostClick,
  className,
}: PostProps) {
  const [editingPost, setEditingPost] = useState<PostPermissionType | null>(null);
  const socialContext = useSocialContextSafe();

  // Usar contexto se disponível, senão usar props
  const currentUserId = propUserId || socialContext?.currentUser?.id || '';
  const currentUserName = propUserName || socialContext?.currentUser?.name || 'Usuário';

  const handlePostClick = () => {
    onPostClick?.(post);
  };

  const handleCommentClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onPostClick?.(post);
  };

  const handleEdit = (postToEdit: PostPermissionType) => {
    setEditingPost(postToEdit);
  };

  // Converter para formato de permissões
  const postForMenu: PostPermissionType = {
    id: parseInt(post.id) || 0,
    user_id: post.authorId,
    title: post.title,
    content: post.content,
    course_id: 0,
    created_at: post.createdAt.toISOString(),
    pinned: post.pinned,
    users: {
      id: post.authorId,
      name: post.authorName,
      email: undefined,
      avatar_url: post.authorAvatar,
    },
  };

  return (
    <>
      <Card 
        className={cn(
          'border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer group',
          className
        )}
        onClick={handlePostClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <PostHeader post={post} className="flex-1" />
            <div onClick={(e) => e.stopPropagation()}>
              <PostActionsMenu post={postForMenu} onEdit={handleEdit} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <PostContent post={post} truncate />
        </CardContent>

        <CardFooter className="pt-3 pb-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between w-full">
            <PostActions
              postId={post.id}
              reactions={post.reactions}
              commentCount={post.commentCount}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onCommentClick={handleCommentClick}
              onShareClick={onShare ? () => onShare(post.id) : undefined}
              onReactionChange={(reactions) => onReactionChange?.(post.id, reactions)}
            />
            <ActivityIndicator post={post} />
          </div>
        </CardFooter>
      </Card>

      <PostEditDialog
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
      />
    </>
  );
}

PostComponent.displayName = 'PostComponent';

const PostComponentMemo = memo(PostComponent);
PostComponentMemo.displayName = 'PostComponent';

export { PostComponentMemo as PostComponent };
