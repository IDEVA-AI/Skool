import { useMutation, useQueryClient } from '@tanstack/react-query';
import { togglePostReaction, toggleCommentReaction, type ReactionType } from '@/services/reactions';
import { Reaction } from '@/types/social';

/**
 * Hook for toggling a post reaction with optimistic updates.
 * Replaces the old local-state-only useReactions hook.
 */
export function useTogglePostReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, reactionType }: { postId: number; reactionType: ReactionType }) =>
      togglePostReaction(postId, reactionType),
    onMutate: async ({ postId, reactionType }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['all-posts'] });

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(['all-posts']);

      // Optimistic update — handled at the component level via local state
      return { previousPosts };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['all-posts'], context.previousPosts);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['all-posts'] });
    },
  });
}

/**
 * Derive reaction counts and user reaction from a Reaction[] array.
 * Pure computation, no hooks needed.
 */
export function getReactionState(reactions: Reaction[], currentUserId: string) {
  const reactionCounts = { like: 0, love: 0, laugh: 0 } as Record<ReactionType, number>;
  let userReaction: ReactionType | null = null;

  for (const r of reactions) {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
    if (r.userId === currentUserId) {
      userReaction = r.type;
    }
  }

  return { reactionCounts, userReaction, totalReactions: reactions.length };
}

/**
 * Hook for toggling a comment reaction with optimistic updates.
 */
export function useToggleCommentReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, reactionType }: { commentId: number; reactionType: ReactionType }) =>
      toggleCommentReaction(commentId, reactionType),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}
