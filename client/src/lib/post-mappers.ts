import { Post as SocialPost, Reaction } from '@/types/social';
import type { PostReaction } from '@/services/reactions';

/**
 * Maps a DB post row (with joined relations and enriched data) to the social Post type.
 * Reusable across feed, hashtag feed, profile, saved posts, etc.
 */
export function toSocialPost(post: any, postReactions?: PostReaction[]): SocialPost {
  const postUser = post.users || {};

  const reactions: Reaction[] = (postReactions || []).map((r) => ({
    id: r.id,
    type: r.reaction_type,
    userId: r.user_id,
    userName: '',
  }));

  return {
    id: String(post.id),
    title: post.title || '',
    content: post.content || '',
    authorId: post.user_id || '',
    authorName: postUser.name || postUser.email?.split('@')[0] || 'Usuario',
    authorAvatar: postUser.avatar_url,
    authorRole: postUser.role || 'user',
    createdAt: new Date(post.created_at),
    reactions,
    comments: [],
    commentCount: post.comment_count || 0,
    pinned: post.pinned,
    category: post.courses?.title,
    recentAvatars: post.recent_avatars || [],
    lastActivityAt: post.last_activity_at ? new Date(post.last_activity_at) : undefined,
  };
}
