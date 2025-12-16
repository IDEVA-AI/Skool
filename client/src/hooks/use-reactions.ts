import { useState, useCallback } from 'react';
import { Reaction, ReactionType } from '@/types/social';

interface UseReactionsProps {
  initialReactions?: Reaction[];
  currentUserId: string;
  currentUserName: string;
}

interface UseReactionsReturn {
  reactions: Reaction[];
  reactionCounts: Record<ReactionType, number>;
  userReaction: ReactionType | null;
  toggleReaction: (type: ReactionType) => void;
  addReaction: (type: ReactionType) => void;
  removeReaction: () => void;
}

/**
 * Reusable hook for managing reactions (likes, loves, laughs)
 * 
 * Features:
 * - Toggle reactions
 * - Track user's current reaction
 * - Calculate reaction counts by type
 * - Optimized for performance
 */
export function useReactions({
  initialReactions = [],
  currentUserId,
  currentUserName,
}: UseReactionsProps): UseReactionsReturn {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);

  // Find user's current reaction
  const userReaction = reactions.find((r) => r.userId === currentUserId)?.type || null;

  // Calculate reaction counts by type
  const reactionCounts = reactions.reduce(
    (acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    },
    { like: 0, love: 0, laugh: 0 } as Record<ReactionType, number>
  );

  const toggleReaction = useCallback(
    (type: ReactionType) => {
      setReactions((prev) => {
        const existingIndex = prev.findIndex((r) => r.userId === currentUserId);

        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          if (existing.type === type) {
            // Remove reaction if clicking the same type
            return prev.filter((r) => r.userId !== currentUserId);
          } else {
            // Replace reaction with new type
            const updated = [...prev];
            updated[existingIndex] = {
              id: existing.id,
              type,
              userId: currentUserId,
              userName: currentUserName,
            };
            return updated;
          }
        } else {
          // Add new reaction
          return [
            ...prev,
            {
              id: `reaction-${Date.now()}-${Math.random()}`,
              type,
              userId: currentUserId,
              userName: currentUserName,
            },
          ];
        }
      });
    },
    [currentUserId, currentUserName]
  );

  const addReaction = useCallback(
    (type: ReactionType) => {
      setReactions((prev) => {
        const exists = prev.some((r) => r.userId === currentUserId);
        if (exists) return prev;

        return [
          ...prev,
          {
            id: `reaction-${Date.now()}-${Math.random()}`,
            type,
            userId: currentUserId,
            userName: currentUserName,
          },
        ];
      });
    },
    [currentUserId, currentUserName]
  );

  const removeReaction = useCallback(() => {
    setReactions((prev) => prev.filter((r) => r.userId !== currentUserId));
  }, [currentUserId]);

  return {
    reactions,
    reactionCounts,
    userReaction,
    toggleReaction,
    addReaction,
    removeReaction,
  };
}

