import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookmarkCheck } from 'lucide-react';
import { useSavedPostsWithDetails } from '@/hooks/use-saved-posts';
import { convertSupabasePostToFeedPost } from '@/lib/post-utils';
import { Feed } from '@/components/social/feed';
import { PostDetailModal } from '@/components/social/post-detail-modal';
import { useState } from 'react';
import { Post } from '@/types/social';
import { useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';
import { getAvatarUrl } from '@/lib/avatar-utils';
import { useCreateComment } from '@/hooks/use-forum';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function SavedPosts() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: savedPostsData, isLoading } = useSavedPostsWithDetails();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const createCommentMutation = useCreateComment();
  const { toast } = useToast();

  const currentUser = user ? {
    name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
    avatar: getAvatarUrl(profile?.avatar_url || user.user_metadata?.avatar_url, profile?.name || user.user_metadata?.name || user.email) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || user.user_metadata?.name || user.email || 'U')}`,
  } : null;

  // Converter posts do Supabase para formato do Feed
  const feedPosts: Post[] = savedPostsData?.map(convertSupabasePostToFeedPost) || [];

  const handleCommentAdd = async (postId: string, content: string, parentId?: string) => {
    try {
      await createCommentMutation.mutateAsync({
        postId: parseInt(postId),
        content,
        parentId: parentId ? parseInt(parentId) : undefined,
      });
      
      toast({
        title: 'Comentário publicado!',
        description: 'Seu comentário foi adicionado',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao comentar',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <BookmarkCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Posts Salvos</h1>
            <p className="text-muted-foreground mt-2">
              Suas postagens favoritas em um só lugar
            </p>
          </div>
        </div>
      </header>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : feedPosts.length > 0 ? (
        <>
          <Feed
            posts={feedPosts}
            isLoading={false}
            onPostClick={(post) => setSelectedPost(post)}
            onCommentAdd={handleCommentAdd}
          />

          <PostDetailModal
            post={selectedPost}
            isOpen={!!selectedPost}
            onClose={() => setSelectedPost(null)}
            currentUserId={user?.id || ''}
            currentUserName={currentUser?.name || 'Usuário'}
            currentUserAvatar={currentUser?.avatar}
            onCommentAdd={handleCommentAdd}
          />
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookmarkCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum post salvo</h3>
            <p className="text-muted-foreground">
              Quando você salvar postagens, elas aparecerão aqui
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

