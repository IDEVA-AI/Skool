import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThumbsUp, MessageSquare, Pin, ArrowDown, Send, Loader2, Link as LinkIcon, Smile } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuth } from "@/hooks/use-auth";
import { useComments, useCreateComment } from "@/hooks/use-forum";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { PostActionsMenu } from "@/components/social/post-actions-menu";
import { getAvatarUrl } from "@/lib/avatar-utils";

interface PostModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PostModal({ post, isOpen, onClose }: PostModalProps) {
  const { user } = useAuth();
  const { data: comments, isLoading: commentsLoading } = useComments(post?.id || 0);
  const createCommentMutation = useCreateComment();
  const { toast } = useToast();
  const [commentContent, setCommentContent] = useState("");

  const currentUser = user ? {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || user.email || 'U')}`,
  } : null;

  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || !post) return;

    try {
      await createCommentMutation.mutateAsync({
        postId: post.id,
        content: commentContent,
      });
      
      toast({
        title: 'Comentário publicado!',
        description: 'Seu comentário foi adicionado',
      });
      
      setCommentContent("");
    } catch (error: any) {
      toast({
        title: 'Erro ao comentar',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  if (!post) return null;

  const postUser = post.users || {};
  const course = post.courses || {};
  const postDate = new Date(post.created_at);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 gap-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>{post.title}</DialogTitle>
        </VisuallyHidden>

        <ScrollArea className="flex-1">
          <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                  <AvatarImage src={postUser.avatar_url} />
                  <AvatarFallback>{(postUser.name || postUser.email || 'U')[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{postUser.name || postUser.email?.split('@')[0] || 'Usuário'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(postDate, { addSuffix: true, locale: ptBR })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {post.pinned && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                    <Pin className="h-3.5 w-3.5 fill-foreground" />
                    Fixado
                  </div>
                )}
                <PostActionsMenu post={post} />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                {post.pinned && <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                {post.pinned && <span className="mt-1 text-lg">🚨</span>}
                <h2 className="text-xl font-bold leading-tight">{post.title}</h2>
              </div>
              
              <div 
                className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Interaction Bar */}
            <div className="flex items-center gap-4 pt-4 border-b border-border/40 pb-4">
              <Button variant="outline" size="sm" className="gap-2 h-8 rounded-md px-3 font-medium text-xs border-border/60">
                <ThumbsUp className="h-3.5 w-3.5" />
                Curtir
                <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] ml-1">0</span>
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                <MessageSquare className="h-3.5 w-3.5" />
                {comments?.length || 0} comentários
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-6 pt-2">
              {commentsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Carregando comentários...</p>
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment: any) => {
                  const commentUser = comment.users || {};
                  const commentDate = new Date(comment.created_at);
                  
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 border border-border/50">
                        <AvatarImage src={getAvatarUrl(commentUser.avatar_url, commentUser.name || commentUser.email) || undefined} />
                        <AvatarFallback>{(commentUser.name || commentUser.email || 'U')[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{commentUser.name || commentUser.email?.split('@')[0] || 'Usuário'}</span>
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(commentDate, { addSuffix: true, locale: ptBR })}</span>
                          </div>
                        </div>
                        <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{comment.content}</p>
                        <div className="flex items-center gap-4 pt-1">
                          <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Comment Input Footer */}
        {currentUser && (
          <div className="p-4 bg-background border-t border-border z-10">
            <div className="flex gap-3">
              <Avatar className="h-9 w-9 border border-border/50 shrink-0">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="relative">
                  <Textarea
                    className="w-full bg-muted/50 rounded-xl pl-4 pr-24 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none min-h-[52px] max-h-32 text-foreground placeholder:text-muted-foreground border border-border/50 shadow-sm"
                    placeholder="Escreva um comentário..."
                    rows={1}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    onKeyDown={(e) => {
                      // Ctrl+A / Cmd+A para selecionar tudo
                      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.select();
                        return;
                      }
                      
                      // Enter para enviar (sem Shift)
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCommentSubmit();
                      }
                    }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                      title="Inserir link"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                      title="Inserir emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted font-medium"
                      title="Inserir GIF"
                    >
                      GIF
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    size="sm"
                    onClick={handleCommentSubmit}
                    disabled={createCommentMutation.isPending || !commentContent.trim()}
                    className="gap-2 rounded-lg"
                    variant="default"
                  >
                    {createCommentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Comentar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
