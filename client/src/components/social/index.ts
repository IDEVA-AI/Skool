// Core components
export { PostComponent as Post } from './post';
export { PostHeader } from './post-header';
export { PostContent } from './post-content';
export { ActivityIndicator } from './activity-indicator';
export { PostDetailModal } from './post-detail-modal';
export { PostEditDialog } from './post-edit-dialog';
export { Feed } from './feed';
export { PostComposerSimple } from './post-composer-simple';
export { PostActions } from './post-actions';
export { PostActionsMenu } from './post-actions-menu';

// Comments
export { CommentComposer } from './comment-composer';
export { CommentList } from './comment-list';
export { CommentItem } from './comment-item';

// Reactions
export { ReactionBar } from './reaction-bar';
export { ReactionButton } from './reaction-button'; // Mantido para compatibilidade

// Context
export { SocialProvider, useSocialContext, useSocialContextSafe } from './social-context';

// Hooks
export { useTogglePostReaction, getReactionState } from '@/hooks/use-reactions';
