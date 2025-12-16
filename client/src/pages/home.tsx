import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { PostModal } from "@/components/post-modal";
import { useAuth } from "@/hooks/use-auth";
import { useAllPosts, useCreatePost } from "@/hooks/use-posts";
import { Feed } from "@/components/social/feed";
import { PostDetailModal } from "@/components/social/post-detail-modal";
import { convertSupabasePostToFeedPost } from "@/lib/post-utils";
import { useComments, useCreateComment } from "@/hooks/use-forum";
import { useAnnouncements } from "@/hooks/use-announcements";
import { useEnrollments, useCourses, useGetOrCreateDefaultCourse } from "@/hooks/use-courses";
import { useCourseProgress } from "@/hooks/use-course-content";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/use-user-role";
import { useProfile } from "@/hooks/use-profile";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnnouncementForm } from "@/components/announcement-form";
import { Plus } from "lucide-react";
import { useSelectedCommunity } from "@/contexts/community-context";
import { useMemo } from "react";
import { Post as PostType } from "@/types/social";
import { getAvatarUrl } from "@/lib/avatar-utils";

export default function Home() {
  const { user } = useAuth();
  const { selectedCommunity } = useSelectedCommunity();
  const { data: allPosts, isLoading: postsLoading } = useAllPosts();
  const { data: announcements } = useAnnouncements();
  const { data: allCourses } = useCourses();
  const { data: enrolledCourseIds = [] } = useEnrollments();
  const createPostMutation = useCreatePost();
  const createCommentMutation = useCreateComment();
  const getOrCreateDefaultCourse = useGetOrCreateDefaultCourse();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();
  const { data: profile } = useProfile();
  
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedFeedPost, setSelectedFeedPost] = useState<PostType | null>(null);

  // Filtrar cursos da comunidade atual
  const communityCourses = useMemo(() => {
    if (!allCourses || !selectedCommunity) return [];
    return allCourses.filter(c => c.community_id === selectedCommunity.id);
  }, [allCourses, selectedCommunity]);

  // Filtrar posts da comunidade atual (através dos cursos)
  const posts = useMemo(() => {
    if (!allPosts || !communityCourses.length) return [];
    const communityCourseIds = communityCourses.map(c => c.id);
    return allPosts.filter((post: any) => communityCourseIds.includes(post.course_id));
  }, [allPosts, communityCourses]);

  // Cursos da comunidade em que o usuário está inscrito
  const enrolledCommunityCourses = useMemo(() => {
    return communityCourses.filter(c => enrolledCourseIds.includes(c.id));
  }, [communityCourses, enrolledCourseIds]);

  // Primeiro curso da comunidade para usar como padrão ao criar post
  // Se o usuário estiver inscrito, usa o primeiro curso inscrito, senão usa o primeiro curso da comunidade
  const defaultCourseId = useMemo(() => {
    if (enrolledCommunityCourses.length > 0) {
      return enrolledCommunityCourses[0].id;
    }
    // Se não estiver inscrito, usa o primeiro curso da comunidade disponível
    return communityCourses.length > 0 ? communityCourses[0].id : null;
  }, [enrolledCommunityCourses, communityCourses]);

  // Converter posts do Supabase para formato do Feed
  const feedPosts = useMemo(() => {
    return posts.map(convertSupabasePostToFeedPost);
  }, [posts]);

  const handlePostCreate = async (title: string, content: string) => {
    try {
      // Se não há curso disponível, cria ou busca um curso padrão
      let courseIdToUse = defaultCourseId;
      
      if (!courseIdToUse && selectedCommunity) {
        // Cria ou busca curso padrão para a comunidade
        courseIdToUse = await getOrCreateDefaultCourse.mutateAsync(selectedCommunity.id);
      }
      
      if (!courseIdToUse) {
        toast({
          title: 'Erro',
          description: 'Não foi possível criar o post. Comunidade não encontrada.',
          variant: 'destructive',
        });
        return;
      }

      await createPostMutation.mutateAsync({
        courseId: courseIdToUse,
        title: title.trim(),
        content: content.trim(),
      });
      
      toast({
        title: 'Post publicado!',
        description: 'Seu post foi publicado com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao publicar',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
      throw error;
    }
  };

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

  const currentUser = user ? {
    name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
    avatar: getAvatarUrl(profile?.avatar_url || user.user_metadata?.avatar_url, profile?.name || user.user_metadata?.name || user.email) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || user.user_metadata?.name || user.email || 'U')}`,
  } : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Post Modal (legacy) */}
      <PostModal 
        post={selectedPost} 
        isOpen={!!selectedPost} 
        onClose={() => setSelectedPost(null)} 
      />

      {/* Post Detail Modal (novo) */}
      <PostDetailModal
        post={selectedFeedPost}
        isOpen={!!selectedFeedPost}
        onClose={() => setSelectedFeedPost(null)}
        currentUserId={user?.id || ''}
        currentUserName={currentUser?.name || 'Usuário'}
        currentUserAvatar={currentUser?.avatar}
        onCommentAdd={handleCommentAdd}
        onReactionChange={(postId, reactions) => {
          // Atualizar reações do post
          // Em uma implementação real, você atualizaria o estado do post
          console.log('Reaction changed:', postId, reactions);
        }}
        onShare={(postId) => {
          console.log('Share post:', postId);
        }}
      />

      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-6">
        <Feed
          posts={feedPosts}
          isLoading={postsLoading}
          onPostCreate={handlePostCreate}
          onCommentAdd={handleCommentAdd}
          onPostClick={(post) => setSelectedFeedPost(post)}
          context={selectedCommunity?.name || 'Comunidade'}
          contextHighlight={true}
          onShare={(postId) => {
            // Implementar compartilhamento se necessário
            console.log('Share post:', postId);
          }}
        />
      </div>

      {/* Sidebar Widgets */}
      <div className="space-y-6">
        <Card className="bg-primary/5 border-primary/10 shadow-none">
          <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-lg text-primary">Anúncios</h3>
              {isAdmin && (
                <AnnouncementForm 
                  mode="create"
                  trigger={
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Criar
                    </Button>
                  }
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements && announcements.length > 0 ? (
              announcements.map((announcement: any, index: number) => {
                const announcementDate = new Date(announcement.created_at);
                return (
                  <div key={announcement.id}>
            <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground block">
                        {formatDistanceToNow(announcementDate, { addSuffix: true, locale: ptBR })}
                      </span>
                      <p className="text-sm font-medium">{announcement.title}</p>
                      <p className="text-xs text-muted-foreground">{announcement.content}</p>
            </div>
                    {index < announcements.length - 1 && <div className="h-px bg-primary/10 my-4" />}
            </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum anúncio no momento</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <h3 className="font-heading font-semibold text-lg">Seu Progresso</h3>
          </CardHeader>
          <CardContent>
            {enrolledCommunityCourses.length > 0 ? (
              <>
            <div className="space-y-4">
                  {enrolledCommunityCourses
                    .slice(0, 3)
                    .map((course) => {
                      const CourseProgressItem = () => {
                        const { progress } = useCourseProgress(course.id);
                        return (
              <div>
                <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium truncate">{course.title}</span>
                              <span className="text-muted-foreground shrink-0 ml-2">{progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-secondary" style={{ width: `${progress}%` }} />
                </div>
              </div>
                        );
                      };
                      return <CourseProgressItem key={course.id} />;
                    })}
            </div>
            <Button variant="outline" className="w-full mt-4 text-xs" asChild>
              <a href="/courses">Continuar Aprendendo</a>
            </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">Você ainda não está inscrito em nenhum curso</p>
                <Button variant="outline" className="w-full text-xs" asChild>
                  <a href="/courses">Explorar Cursos</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
