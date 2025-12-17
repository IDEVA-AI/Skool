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
import { useSelectedCommunity } from '@/contexts/community-context';

// Função para verificar se há texto real no conteúdo HTML
function hasTextContent(html: string): boolean {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || '';
  return text.trim().length > 0;
}

export default function Community() {
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
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

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


  const currentUser = user ? {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || user.email || 'U')}`,
  } : null;

  const handlePublish = async () => {
    if (!postTitle.trim() || !postContent.trim() || !hasTextContent(postContent)) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

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
        title: postTitle,
        content: postContent,
      });
      
      toast({
        title: 'Post publicado!',
        description: 'Seu post foi publicado com sucesso',
      });
      
      setPostTitle("");
      setPostContent("");
      setIsExpanded(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao publicar',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Post Modal */}
      <PostModal 
        post={selectedPost} 
        isOpen={!!selectedPost} 
        onClose={() => setSelectedPost(null)} 
      />

      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* New Post Input */}
        <Card className="border-border/50 shadow-sm overflow-hidden transition-all duration-300">
          {!isExpanded ? (
             <CardContent className="p-4 flex items-center gap-4 cursor-text" onClick={() => setIsExpanded(true)}>
               {currentUser && (
                 <>
               <Avatar className="h-10 w-10">
                 <AvatarImage src={currentUser.avatar} />
                     <AvatarFallback>{currentUser.name[0]?.toUpperCase() || 'U'}</AvatarFallback>
               </Avatar>
               <div className="flex-1">
                 <input 
                    type="text"
                    placeholder="Escreva algo..." 
                    className="w-full bg-transparent border-none outline-none text-muted-foreground cursor-text"
                    readOnly
                 />
        </div>
                 </>
               )}
             </CardContent>
          ) : (
            <CardContent className="pt-6 pb-4 px-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {currentUser && (
                <>
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback>{currentUser.name[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-semibold text-foreground">{currentUser.name}</span>
                  <span className="text-muted-foreground">publicando em</span>
                  <span className="font-medium text-primary">{selectedCommunity?.name || 'Comunidade'}</span>
                </div>
              </div>

              <div className="space-y-2">
                  <Input
                      placeholder="Título" 
                      className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 h-auto py-0"
                      autoFocus
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                  />
                  <TipTapEditor
                    placeholder="Escreva algo..." 
                    value={postContent}
                    onChange={setPostContent}
                    className="border-none shadow-none"
                  />
                </div>
                </>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/10">
                  <div className="flex items-center gap-4 text-muted-foreground">
                      <button className="hover:text-primary transition-colors"><Paperclip className="h-5 w-5" /></button>
                      <button className="hover:text-primary transition-colors"><LinkIcon className="h-5 w-5" /></button>
                      <button className="hover:text-primary transition-colors"><Youtube className="h-5 w-5" /></button>
                      <button className="hover:text-primary transition-colors"><BarChart2 className="h-5 w-5" /></button>
                      <button className="hover:text-primary transition-colors"><Smile className="h-5 w-5" /></button>
                      <button className="hover:text-primary transition-colors font-bold text-xs border border-current rounded px-1 py-0.5">GIF</button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        className="text-muted-foreground font-semibold hover:bg-transparent hover:text-foreground"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(false);
                        }}
                      >
                        CANCELAR
                      </Button>
                <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handlePublish}
                        disabled={createPostMutation.isPending || getOrCreateDefaultCourse.isPending || !postTitle.trim() || !postContent.trim() || !hasTextContent(postContent)}
                        title={
                          !postTitle.trim() || !postContent.trim()
                            ? 'Preencha todos os campos'
                            : undefined
                        }
                >
                  {createPostMutation.isPending || getOrCreateDefaultCourse.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {getOrCreateDefaultCourse.isPending ? 'Preparando...' : 'Publicando...'}
                    </>
                  ) : (
                          'PUBLICAR'
                  )}
                </Button>
                  </div>
              </div>
            </CardContent>
        )}
        </Card>

        {/* Posts Feed */}
      {postsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/50 shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post: any) => {
            const postUser = post.users || {};
            const course = post.courses || {};
            const postDate = new Date(post.created_at);
            
            return (
            <Card 
                key={post.id} 
                className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                onClick={() => setSelectedPost(post)}
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div className="flex gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={postUser.avatar_url} />
                        <AvatarFallback>{(postUser.name || postUser.email || 'U')[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">{postUser.name || postUser.email?.split('@')[0] || 'Usuário'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {post.pinned && (
                                <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">!</span> 
                            )}
                          <span>{formatDistanceToNow(postDate, { addSuffix: true, locale: ptBR })}</span>
                          {course.title && (
                            <>
                              <span>•</span>
                                <span className="uppercase font-medium text-xs tracking-wide text-muted-foreground/80">{course.title}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                {post.pinned && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                    <Pin className="h-3.5 w-3.5 fill-foreground" />
                    Fixado
                  </div>
                )}
                </CardHeader>
              
              <CardContent className="pb-4 block flow-root">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                      {post.pinned && <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                      {post.pinned && <span className="mt-1 text-lg">🚨</span>}
                      <h3 className="text-xl font-bold leading-tight">{post.title}</h3>
                  </div>
                  <div 
                    className="text-sm leading-relaxed text-foreground/90 prose prose-sm dark:prose-invert max-w-none [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
                </CardContent>
              
              <CardFooter className="pt-2 pb-4 flex items-center justify-between">
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2 h-8 px-2">
                    <ThumbsUp className="h-5 w-5" />
                    <span className="text-sm font-medium">0</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-primary gap-2 h-8 px-2"
                    onClick={() => setSelectedPost(post)}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-sm font-medium">Comentar</span>
                  </Button>
                </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum post disponível. Seja o primeiro a postar!</p>
        </div>
        )}
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

