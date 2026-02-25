import { supabase } from '@/lib/supabase';

export type ReactionType = 'like' | 'love' | 'laugh';

export interface PostReaction {
  id: string;
  post_id: number;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

/**
 * Batch-fetch reactions for multiple posts
 */
export async function getReactionsByPostIds(postIds: number[]): Promise<Map<number, PostReaction[]>> {
  if (postIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('post_reactions')
    .select('*')
    .in('post_id', postIds);

  if (error) throw error;

  const map = new Map<number, PostReaction[]>();
  for (const reaction of (data || [])) {
    const list = map.get(reaction.post_id) || [];
    list.push(reaction as PostReaction);
    map.set(reaction.post_id, list);
  }
  return map;
}

/**
 * Toggle a reaction on a post (upsert or delete)
 */
export async function togglePostReaction(
  postId: number,
  reactionType: ReactionType
): Promise<{ action: 'added' | 'changed' | 'removed'; reaction?: PostReaction }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nao autenticado');

  // Check if user already has a reaction on this post
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    if (existing.reaction_type === reactionType) {
      // Same type: remove
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      return { action: 'removed' };
    } else {
      // Different type: update
      const { data, error } = await supabase
        .from('post_reactions')
        .update({ reaction_type: reactionType })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return { action: 'changed', reaction: data as PostReaction };
    }
  } else {
    // No existing: insert
    const { data, error } = await supabase
      .from('post_reactions')
      .insert({
        post_id: postId,
        user_id: user.id,
        reaction_type: reactionType,
      })
      .select()
      .single();
    if (error) throw error;
    return { action: 'added', reaction: data as PostReaction };
  }
}

// ==================== Comment Reactions ====================

export interface CommentReaction {
  id: string;
  comment_id: number;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

/**
 * Batch-fetch reactions for multiple comments
 */
export async function getReactionsByCommentIds(commentIds: number[]): Promise<Map<number, CommentReaction[]>> {
  if (commentIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('comment_reactions')
    .select('*')
    .in('comment_id', commentIds);

  if (error) throw error;

  const map = new Map<number, CommentReaction[]>();
  for (const reaction of (data || [])) {
    const list = map.get(reaction.comment_id) || [];
    list.push(reaction as CommentReaction);
    map.set(reaction.comment_id, list);
  }
  return map;
}

/**
 * Toggle a reaction on a comment (upsert or delete)
 */
export async function toggleCommentReaction(
  commentId: number,
  reactionType: ReactionType
): Promise<{ action: 'added' | 'changed' | 'removed'; reaction?: CommentReaction }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nao autenticado');

  const { data: existing } = await supabase
    .from('comment_reactions')
    .select('*')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    if (existing.reaction_type === reactionType) {
      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      return { action: 'removed' };
    } else {
      const { data, error } = await supabase
        .from('comment_reactions')
        .update({ reaction_type: reactionType })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return { action: 'changed', reaction: data as CommentReaction };
    }
  } else {
    const { data, error } = await supabase
      .from('comment_reactions')
      .insert({
        comment_id: commentId,
        user_id: user.id,
        reaction_type: reactionType,
      })
      .select()
      .single();
    if (error) throw error;
    return { action: 'added', reaction: data as CommentReaction };
  }
}
