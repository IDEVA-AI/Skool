import { useState, memo } from 'react';
import { Post } from '@/types/social';
import { PostHeader } from './post-header';
import { PostContent } from './post-content';
import { ActivityIndicator } from './activity-indicator';
import { PostActions } from './post-actions';
import { PostActionsMenu } from './post-actions-menu';
import { PostEditDialog } from './post-edit-dialog';
import { cn } from '@/lib/utils';
import { Post as PostPermissionType } from '@/lib/permissions';
import { useSocialContextSafe } from './social-context';

interface PostProps {
  post: Post;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  onCommentAdd?: (postId: string, content: string, parentId?: string) => void;
  onShare?: (postId: string) => void;
  onPostClick?: (post: Post) => void;
  className?: string;
}

function PostComponent({
  post,
  currentUserId: propUserId,
  currentUserName: propUserName,
  currentUserAvatar: propUserAvatar,
  onCommentAdd,
  onShare,
  onPostClick,
  className,
}: PostProps) {
  const [editingPost, setEditingPost] = useState<PostPermissionType | null>(null);
  const socialContext = useSocialContextSafe();

  const currentUserId = propUserId || socialContext?.currentUser?.id || '';
  const currentUserName = propUserName || socialContext?.currentUser?.name || 'Usuario';

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
      <article
        className={cn(
          'feed-card group cursor-pointer',
          'py-6 px-5 transition-all duration-300',
          'hover:bg-zinc-50/80',
          className
        )}
        onClick={handlePostClick}
      >
        {/* Top row: author + menu */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <PostHeader post={post} className="flex-1" />
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <PostActionsMenu post={postForMenu} onEdit={handleEdit} />
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <PostContent post={post} truncate />
        </div>

        {/* Bottom row: actions + activity */}
        <div
          className="flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <PostActions
            postId={post.id}
            reactions={post.reactions}
            commentCount={post.commentCount}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            onCommentClick={handleCommentClick}
            onShareClick={onShare ? () => onShare(post.id) : undefined}
          />
          <ActivityIndicator post={post} />
        </div>
      </article>

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
