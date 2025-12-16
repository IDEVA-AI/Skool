import { memo } from 'react';
import { Comment } from '@/types/social';
import { CommentItem } from './comment-item';
import { ReactionType } from '@/types/social';

interface CommentListProps {
  comments: Comment[];
  currentUserId: string;
  currentUserName: string;
  depth?: number;
  maxDepth?: number;
  onReply: (content: string, parentId: string) => void;
  onReactionChange?: (commentId: string, reactions: Array<{ id: string; type: ReactionType; userId: string; userName: string }>) => void;
}

/**
 * Recursive CommentList component
 * 
 * Optimizations:
 * - Memoized to prevent unnecessary re-renders
 * - Only re-renders when comments array reference changes
 * - Supports infinite nesting depth via recursion
 */
export const CommentList = memo(function CommentList({
  comments,
  currentUserId,
  currentUserName,
  depth = 0,
  maxDepth = 10,
  onReply,
  onReactionChange,
}: CommentListProps) {
  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          depth={depth}
          maxDepth={maxDepth}
          onReply={onReply}
          onReactionChange={onReactionChange}
        />
      ))}
    </div>
  );
});

