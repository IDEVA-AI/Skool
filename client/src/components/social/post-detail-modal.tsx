import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Post, Comment } from '@/types/social';
import { PostHeader } from './post-header';
import { PostContent } from './post-content';
import { PostActions } from './post-actions';
import { PostActionsMenu } from './post-actions-menu';
import { PostEditDialog } from './post-edit-dialog';
import { CommentComposer, CommentComposerHandle } from './comment-composer';
import { CommentList } from './comment-list';
import { X, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComments } from '@/hooks/use-forum';
import { useQuery } from '@tanstack/react-query';
import { getReactionsByCommentIds } from '@/services/reactions';
import { Post as PostPermissionType } from '@/lib/permissions';
import { getAvatarUrl } from '@/lib/avatar-utils';
import { useSocialContextSafe } from './social-context';

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  onCommentAdd?: (postId: string, content: string, parentId?: string) => void;
  onShare?: (postId: string) => void;
}

export function PostDetailModal({
  post,
  isOpen,
  onClose,
  currentUserId: propUserId,
  currentUserName: propUserName,
  currentUserAvatar: propUserAvatar,
  onCommentAdd,
  onShare,
}: PostDetailModalProps) {
  const [editingPost, setEditingPost] = useState<PostPermissionType | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; authorName: string } | null>(null);
  const commentComposerRef = useRef<HTMLDivElement>(null);
  const commentComposerHandleRef = useRef<CommentComposerHandle | null>(null);
  
  const socialContext = useSocialContextSafe();

  // Usar contexto se disponível, senão usar props
  const currentUserId = propUserId || socialContext?.currentUser?.id || '';
  const currentUserName = propUserName || socialContext?.currentUser?.name || 'Usuário';
  const currentUserAvatar = propUserAvatar || socialContext?.currentUser?.avatar;

  // Buscar comentários
  const postId = post ? parseInt(post.id) || 0 : 0;
  const { data: supabaseComments, isLoading: commentsLoading } = useComments(postId);

  // Batch-fetch comment reactions
  const commentIds = useMemo(() => {
    return (supabaseComments || []).map((c: any) => c.id as number);
  }, [supabaseComments]);

  const { data: commentReactionsMap } = useQuery({
    queryKey: ['comment-reactions', commentIds],
    queryFn: () => getReactionsByCommentIds(commentIds),
    enabled: commentIds.length > 0,
  });

  // Converter comentários para árvore
  const comments = useMemo(() => {
    if (!supabaseComments?.length) return [];

    const allComments: Comment[] = supabaseComments.map((comment: any) => {
      const commentUser = comment.users || {};
      const rawReactions = commentReactionsMap?.get(comment.id) || [];
      return {
        id: String(comment.id),
        content: comment.content,
        authorId: comment.user_id,
        authorName: commentUser.name || commentUser.email?.split('@')[0] || 'Usuário',
        authorAvatar: getAvatarUrl(commentUser.avatar_url, commentUser.name || commentUser.email) || undefined,
        createdAt: new Date(comment.created_at),
        reactions: rawReactions.map(r => ({
          id: r.id,
          type: r.reaction_type,
          userId: r.user_id,
          userName: '',
        })),
        parentId: comment.parent_id ? String(comment.parent_id) : undefined,
      };
    });

    // Organizar em árvore
    const rootComments: Comment[] = [];
    const commentsMap = new Map<string, Comment>();

    allComments.forEach(comment => {
      commentsMap.set(comment.id, { ...comment, replies: [] });
    });

    allComments.forEach(comment => {
      const commentWithReplies = commentsMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentsMap.get(comment.parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }, [supabaseComments, commentReactionsMap]);

  const handleCommentSubmit = useCallback(async (content: string, parentId?: string) => {
    if (!post) return;
    await onCommentAdd?.(post.id, content, parentId);
    setReplyingTo(null);
  }, [post, onCommentAdd]);

  const handleReply = useCallback((content: string, parentId: string) => {
    handleCommentSubmit(content, parentId);
  }, [handleCommentSubmit]);

  const handleReplyClick = useCallback((commentId: string, authorName: string) => {
    setReplyingTo({ commentId, authorName });
  }, []);

  // Scroll e foco ao responder
  useEffect(() => {
    if (replyingTo && commentComposerRef.current) {
      setTimeout(() => {
        commentComposerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => commentComposerHandleRef.current?.focus(), 300);
      }, 100);
    }
  }, [replyingTo]);

  const handleEdit = useCallback((postToEdit: PostPermissionType) => {
    setEditingPost(postToEdit);
  }, []);

  if (!post) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-background border-zinc-100 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>{post.title}</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <h2 className="text-lg font-semibold truncate pr-4">{post.title || 'Postagem'}</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Post Header + Menu */}
            <div className="flex items-start justify-between gap-3">
              <PostHeader post={post} className="flex-1" />
              <PostActionsMenu post={postForMenu} onEdit={handleEdit} />
            </div>

            {/* Post Content */}
            <PostContent post={post} showTitle={false} />

            {/* Post Actions */}
            <div className="flex items-center pt-4 border-t border-zinc-100">
              <PostActions
                postId={post.id}
                reactions={post.reactions}
                commentCount={post.commentCount}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onCommentClick={() => {}}
                onShareClick={onShare ? () => onShare(post.id) : undefined}
              />
            </div>

            {/* Comments Section */}
            <div className="space-y-4 pt-6 border-t border-zinc-100">
              <h3 className="text-base font-semibold">
                Comentários {comments.length > 0 && `(${comments.length})`}
              </h3>

              {commentsLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm">Carregando...</span>
                </div>
              ) : comments.length > 0 ? (
                <CommentList
                  comments={comments}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  onReply={handleReply}
                  onReplyClick={handleReplyClick}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Nenhum comentário</p>
                  <p className="text-xs text-muted-foreground">Seja o primeiro a comentar!</p>
                </div>
              )}

              {/* Comment Composer */}
              {onCommentAdd && (
                <div ref={commentComposerRef} className="pt-4 border-t border-border/30">
                  <CommentComposer
                    ref={commentComposerHandleRef}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    currentUserAvatar={currentUserAvatar}
                    placeholder="Escreva um comentário..."
                    replyingTo={replyingTo}
                    onSubmit={(content, parentId) => handleCommentSubmit(content, parentId || replyingTo?.commentId)}
                  />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>

      <PostEditDialog
        post={editingPost}
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
      />
    </Dialog>
  );
}
