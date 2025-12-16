import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Play, PlayCircle, FileText, Download, ChevronLeft, Loader2, Lock } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useCourse, useIsEnrolled } from "@/hooks/use-courses";
import { useModules, useLessons, useLessonProgress, useMarkLessonComplete, useCourseProgress } from "@/hooks/use-course-content";
import { useHasCourseAccess } from "@/hooks/use-course-invites";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CourseView() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const courseId = parseInt(params.id || "0");
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: modules, isLoading: modulesLoading } = useModules(courseId);
  const { data: completedLessonIds = [] } = useLessonProgress(courseId);
  const { progress } = useCourseProgress(courseId);
  const markCompleteMutation = useMarkLessonComplete();
  const { toast } = useToast();
  const isEnrolled = useIsEnrolled(courseId);
  const { data: hasAccess, isLoading: accessLoading } = useHasCourseAccess(courseId);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  // Verificar acesso quando o curso carregar
  useEffect(() => {
    if (!courseLoading && course) {
      // Se curso está bloqueado e usuário não tem acesso, redirecionar
      if (course.is_locked && !hasAccess && !accessLoading) {
        setLocation(`/purchase?courseId=${courseId}`);
      }
    }
  }, [course, courseLoading, hasAccess, accessLoading, courseId, setLocation]);

  // Selecionar primeiro módulo e primeira aula por padrão
  if (modules && modules.length > 0 && !selectedModuleId) {
    setSelectedModuleId(modules[0].id);
  }

  const selectedModule = modules?.find(m => m.id === selectedModuleId);
  const { data: lessons } = useLessons(selectedModuleId || 0);
  const selectedLesson = lessons?.find(l => l.id === selectedLessonId) || lessons?.[0];

  if (selectedModule && lessons && lessons.length > 0 && !selectedLessonId) {
    setSelectedLessonId(lessons[0].id);
  }

  const handleMarkComplete = async (lessonId: number) => {
    try {
      await markCompleteMutation.mutateAsync(lessonId);
      toast({
        title: 'Aula concluída!',
        description: 'Seu progresso foi atualizado',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível marcar como concluída',
        variant: 'destructive',
      });
    }
  };

  const isLessonCompleted = (lessonId: number) => completedLessonIds.includes(lessonId);

  if (courseLoading || modulesLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 md:-m-8">
        <div className="h-14 border-b border-border/40 bg-background flex items-center px-4 md:px-8 shrink-0 gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex-1 flex">
          <div className="w-80 border-r p-4 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="flex-1 p-8">
            <Skeleton className="aspect-video w-full mb-6" />
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Curso não encontrado</p>
          <Link href="/courses">
            <Button>Voltar para Cursos</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Verificar se curso está bloqueado e usuário não tem acesso
  if (course.is_locked && !hasAccess && !accessLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="text-center">Curso Bloqueado</CardTitle>
            <CardDescription className="text-center">
              Este curso requer compra ou convite para acessar o conteúdo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">{course.title}</h3>
              {course.description && (
                <p className="text-sm text-muted-foreground">{course.description}</p>
              )}
            </div>
            <Button 
              className="w-full" 
              onClick={() => setLocation(`/purchase?courseId=${courseId}`)}
            >
              <Lock className="mr-2 h-4 w-4" />
              Comprar Curso
            </Button>
            <Link href="/courses">
              <Button variant="outline" className="w-full">
                Voltar para Cursos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 md:-m-8">
      {/* Top Bar */}
      <div className="h-14 border-b border-border/40 bg-background flex items-center px-4 md:px-8 shrink-0 gap-4">
        <Link href="/courses">
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <Separator orientation="vertical" className="h-6" />
        <h1 className="font-heading font-semibold text-sm md:text-base truncate flex-1">
          {course.title}
        </h1>
        <div className="text-xs text-muted-foreground hidden md:block">
          {progress}% Concluído
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Modules List */}
        <div className="w-80 border-r border-border/40 bg-background hidden lg:flex flex-col">
          <div className="p-4 border-b border-border/40">
            <h3 className="font-semibold">Conteúdo do Curso</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {modules && modules.length > 0 ? (
                modules.map((module) => {
                  const moduleLessons = lessons?.filter(l => l.module_id === module.id) || [];
                  const completedCount = moduleLessons.filter(l => isLessonCompleted(l.id)).length;
                  const isCurrentModule = selectedModuleId === module.id;

                  return (
                    <div key={module.id} className="space-y-1">
                      <div
                        onClick={() => setSelectedModuleId(module.id)}
                  className={cn(
                          "flex items-center gap-2 p-2 rounded-md text-sm transition-colors cursor-pointer",
                          isCurrentModule
                            ? "bg-primary/5 text-primary font-medium"
                      : "hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <div className="flex-1">
                          <p className="font-medium">{module.title}</p>
                          <p className="text-xs opacity-70">
                            {completedCount}/{moduleLessons.length} aulas concluídas
                    </p>
                  </div>
                </div>
                      {isCurrentModule && moduleLessons.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {moduleLessons.map((lesson) => {
                            const isCompleted = isLessonCompleted(lesson.id);
                            const isSelected = selectedLessonId === lesson.id;

                            return (
                              <div
                                key={lesson.id}
                                onClick={() => setSelectedLessonId(lesson.id)}
                                className={cn(
                                  "flex items-center gap-2 p-2 rounded-md text-xs transition-colors cursor-pointer",
                                  isSelected
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-muted/30 text-muted-foreground"
                                )}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                                ) : (
                                  <PlayCircle className="h-3 w-3 shrink-0" />
                                )}
                                <span className="truncate">{lesson.title}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground p-4">Nenhum módulo disponível</p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-muted/10">
          {selectedLesson ? (
            <>
          <div className="aspect-video bg-black w-full shrink-0 flex items-center justify-center relative group">
                {selectedLesson.content_url ? (
                  selectedLesson.content_type === 'video' ? (
                    <video
                      src={selectedLesson.content_url}
                      controls
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="text-white text-center p-8">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">{selectedLesson.title}</p>
                      <a
                        href={selectedLesson.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Abrir conteúdo
                      </a>
                    </div>
                  )
                ) : (
                  <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-white">
                        <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
                        {selectedModule && (
                          <p className="text-sm opacity-80">{selectedModule.title}</p>
                        )}
              </div>
            </div>
            <Button size="icon" className="h-16 w-16 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/20 text-white">
              <Play className="h-8 w-8 ml-1 fill-white" />
            </Button>
                  </>
                )}
          </div>

          <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-heading font-bold mb-2">{selectedLesson.title}</h2>
                    {selectedModule && (
                      <p className="text-muted-foreground">{selectedModule.title}</p>
                    )}
                  </div>
                  {!isLessonCompleted(selectedLesson.id) && (
                    <Button
                      onClick={() => handleMarkComplete(selectedLesson.id)}
                      disabled={markCompleteMutation.isPending}
                    >
                      {markCompleteMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Marcar como Concluída
                        </>
                      )}
                    </Button>
                  )}
                  {isLessonCompleted(selectedLesson.id) && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Concluída</span>
                    </div>
                  )}
                </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-transparent border-b border-border/40 w-full justify-start h-auto p-0 rounded-none gap-6">
                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3">
                      Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3">
                      Recursos
                    </TabsTrigger>
              </TabsList>
              
                  <TabsContent value="overview" className="mt-6 space-y-6">
                <div>
                      <h3 className="text-xl font-heading font-bold mb-4">Sobre esta aula</h3>
                  <p className="text-muted-foreground leading-relaxed">
                        {selectedLesson.content_type === 'video' 
                          ? 'Assista ao vídeo acima para aprender o conteúdo desta aula.'
                          : 'Acesse o conteúdo acima para continuar seu aprendizado.'}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="resources" className="mt-6">
                <div className="space-y-3">
                      {selectedLesson.content_url && selectedLesson.content_type === 'pdf' && (
                        <div className="flex items-center gap-3 p-3 rounded-md border border-border/50 hover:bg-muted/30 transition-colors">
                          <div className="h-10 w-10 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                            <p className="text-sm font-medium">Material da Aula</p>
                            <p className="text-xs text-muted-foreground">PDF</p>
                    </div>
                          <Button size="icon" variant="ghost" asChild>
                            <a href={selectedLesson.content_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                            </a>
                    </Button>
                  </div>
                      )}
                      {!selectedLesson.content_url && (
                        <p className="text-sm text-muted-foreground">Nenhum recurso adicional disponível para esta aula.</p>
                      )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Selecione uma aula para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
