import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TipTapEditor } from '@/components/tiptap-editor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  ThumbsUp, 
  MessageSquare, 
  Pin, 
  Paperclip, 
  Link as LinkIcon, 
  Youtube, 
  BarChart2, 
  Smile, 
  Loader2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PostModal } from '@/components/post-modal';
import { useAllPosts, useCreatePost } from '@/hooks/use-posts';
import { useCourses, useEnrollments, useGetOrCreateDefaultCourse } from '@/hooks/use-courses';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useAnnouncements } from '@/hooks/use-announcements';
import { useCourseProgress } from '@/hooks/use-course-content';
import { useIsAdmin } from '@/hooks/use-user-role';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { AnnouncementForm } from '@/components/announcement-form';
import { AnnouncementBanner } from '@/components/announcement-banner';
import { useSelectedCommunity } from '@/contexts/community-context';

// Função para verificar se há texto real no conteúdo HTML
function hasTextContent(html: string): boolean {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || '';
  return text.trim().length > 0;
}

export default function Feed() {
  const { user } = useAuth();
  const { selectedCommunity } = useSelectedCommunity();
  const { data: allPosts, isLoading: postsLoading } = useAllPosts();
  const { data: announcements } = useAnnouncements();
  const { data: allCourses } = useCourses();
  const { data: enrolledCourseIds = [] } = useEnrollments();
  const createPostMutation = useCreatePost();
  const getOrCreateDefaultCourse = useGetOrCreateDefaultCourse();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();
  const { data: courseProgress } = useCourseProgress();

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

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
  const defaultCourse = useMemo(() => {
    return enrolledCommunityCourses.length > 0 
      ? enrolledCommunityCourses[0] 
      : communityCourses.length > 0 
        ? communityCourses[0] 
        : null;
  }, [enrolledCommunityCourses, communityCourses]);

  // Ordenar posts: pinned primeiro, depois por data
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
  }, [posts]);

  const handleCreatePost = async (title: string, content: string) => {
    if (!user || !defaultCourse) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o post. Verifique se você está inscrito em algum curso.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Tentar obter ou criar curso padrão
      const course = await getOrCreateDefaultCourse.mutateAsync({
        communityId: selectedCommunity?.id || 0,
      });

      await createPostMutation.mutateAsync({
        title,
        content,
        courseId: course.id,
      });

      toast({
        title: 'Post criado!',
        description: 'Seu post foi publicado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar post',
        description: error.message || 'Não foi possível criar o post.',
        variant: 'destructive',
      });
    }
  };

  if (postsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avisos */}
      {isAdmin && announcements && announcements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Avisos</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnnouncementForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Aviso
            </Button>
          </div>
          {announcements
            .filter((announcement: any) => announcement && announcement.id)
            .map((announcement: any) => (
              <AnnouncementBanner
                key={announcement.id}
                announcement={announcement}
                isAdmin={isAdmin}
              />
            ))}
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post: any) => {
            const postUser = post.users || {};
            const course = post.courses || {};
            const postDate = new Date(post.created_at);

            return (
              <Card 
                key={post.id} 
                className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={postUser.avatar_url} />
                        <AvatarFallback>
                          {(postUser.name || postUser.email || 'U')[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{postUser.name || postUser.email?.split('@')[0] || 'Usuário'}</span>
                          {post.pinned && (
                            <Pin className="h-3.5 w-3.5 text-primary fill-current" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{formatDistanceToNow(postDate, { addSuffix: true, locale: ptBR })}</span>
                          {course.title && (
                            <>
                              <span>•</span>
                              <span>{course.title}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {post.title && (
                    <h3 className="text-lg font-bold leading-tight">{post.title}</h3>
                  )}
                  {hasTextContent(post.content) && (
                    <div
                      className="text-sm leading-relaxed text-foreground/90 prose prose-sm dark:prose-invert max-w-none [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  )}
                </CardContent>

                <CardFooter className="pt-3 pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="gap-2 h-8">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">0</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 h-8">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">{post.comment_count || 0}</span>
                    </Button>
                  </div>
                  {courseProgress && courseProgress.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BarChart2 className="h-3 w-3" />
                      <span>Progresso do curso</span>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <Card className="border-border/50 border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum post ainda. Seja o primeiro a compartilhar!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Post */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Modal de Aviso */}
      {showAnnouncementForm && (
        <AnnouncementForm
          isOpen={showAnnouncementForm}
          onClose={() => setShowAnnouncementForm(false)}
        />
      )}
    </div>
  );
}

