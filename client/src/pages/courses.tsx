import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle, Search, Filter, Loader2, Lock, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useCourses, useCoursesByCommunity, useEnrollments, useEnrollInCourse, useIsEnrolled, getCourseCoverImageUrl } from "@/hooks/use-courses";
import { useCourseProgress } from "@/hooks/use-course-content";
import { useToast } from "@/hooks/use-toast";
import { useHasCourseAccess } from "@/hooks/use-course-invites";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelectedCommunity } from "@/contexts/community-context";

type FilterStatus = 'all' | 'enrolled' | 'free' | 'locked';
type SortOption = 'default' | 'recent' | 'alphabetical' | 'progress';

export default function Courses() {
  const [location, setLocation] = useLocation();
  const { selectedCommunity } = useSelectedCommunity();

  // Se há comunidade selecionada, buscar apenas cursos dessa comunidade
  const { data: allCourses, isLoading: allCoursesLoading, error: allCoursesError } = useCourses();
  const { data: communityCourses, isLoading: communityCoursesLoading, error: communityCoursesError } = useCoursesByCommunity(selectedCommunity?.id);

  // Usar cursos da comunidade se houver comunidade selecionada, senão todos
  const courses = selectedCommunity ? communityCourses : allCourses;
  const isLoading = selectedCommunity ? communityCoursesLoading : allCoursesLoading;
  const error = selectedCommunity ? communityCoursesError : allCoursesError;

  const { data: enrolledCourseIds = [] } = useEnrollments();

  const enrollMutation = useEnrollInCourse();
  const { toast } = useToast();

  // Estados de filtro e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  // Filtrar e ordenar cursos
  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    let result = [...courses];

    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      result = result.filter(course => {
        const isEnrolled = enrolledCourseIds.includes(course.id);
        switch (statusFilter) {
          case 'enrolled':
            return isEnrolled;
          case 'free':
            return !(course as any).is_locked && !isEnrolled;
          case 'locked':
            return (course as any).is_locked && !isEnrolled;
          default:
            return true;
        }
      });
    }

    // Ordenação
    // Se for 'default', mantém a ordem do banco (campo order)
    if (sortOption !== 'default') {
      result.sort((a, b) => {
        switch (sortOption) {
          case 'alphabetical':
            return a.title.localeCompare(b.title);
          case 'recent':
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          default:
            return 0;
        }
      });
    }

    return result;
  }, [courses, searchQuery, statusFilter, sortOption, enrolledCourseIds]);

  const hasActiveFilters = statusFilter !== 'all' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortOption('default');
  };

  const handleEnroll = async (e: React.MouseEvent, courseId: number) => {
    e.stopPropagation();
    try {
      await enrollMutation.mutateAsync(courseId);
      toast({
        title: 'Inscrição realizada!',
        description: 'Você agora tem acesso ao curso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao se inscrever',
        description: error.message || 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleCardClick = (course: any) => {
    const isEnrolled = enrolledCourseIds.includes(course.id);

    if (isEnrolled) {
      setLocation(`/courses/${course.id}`);
      return;
    }

    // Se curso está bloqueado, redirecionar para página de compra
    if (course.is_locked) {
      setLocation(`/purchase?courseId=${course.id}`);
      return;
    }

    // Curso não bloqueado, permitir inscrição direta
    handleEnroll({ stopPropagation: () => { } } as any, course.id);
  };

  const handlePurchaseClick = (e: React.MouseEvent, courseId: number) => {
    e.stopPropagation();
    setLocation(`/purchase?courseId=${courseId}`);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tighter text-foreground drop-shadow-sm">Classroom</h1>
          <p className="text-muted-foreground mt-2 font-medium">Seus treinamentos e materiais exclusivos.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              className="pl-9 h-9 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className={`h-9 w-9 shrink-0 ${hasActiveFilters ? 'border-primary text-primary' : ''}`}>
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
                <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="enrolled">Inscritos</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="free">Gratuitos</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="locked">Bloqueados</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                <DropdownMenuRadioItem value="default">Ordem padrão</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="recent">Mais recentes</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="alphabetical">Alfabético</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs" onClick={clearFilters}>
                    <X className="h-3 w-3 mr-2" /> Limpar filtros
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-full flex flex-col overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            const CourseProgress = ({ courseId }: { courseId: number }) => {
              const { progress } = useCourseProgress(courseId);
              return (
                <>
                  <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <span>Progresso</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </>
              );
            };

            const statusBadge = () => {
              if (isEnrolled) {
                return { text: 'INSCRITO', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
              }
              if ((course as any).is_locked) {
                return { text: 'BLOQUEADO', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
              }
              return { text: 'GRATUITO', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
            };

            const badge = statusBadge();

            return (
              <div
                key={course.id}
                onClick={() => handleCardClick(course)}
                className="cursor-pointer"
              >
                <Card className="h-full flex flex-col overflow-hidden glass-card hover:shadow-xl hover:-translate-y-1 hover:border-white/20 transition-all duration-500 group">
                  <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                    {(() => {
                      const coverImageUrl = getCourseCoverImageUrl(course);
                      return coverImageUrl ? (
                        <>
                          <img
                            src={coverImageUrl}
                            alt={course.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-black" />
                      );
                    })()}
                    {((course as any).is_locked) && !isEnrolled && (
                      <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
                        <Lock className="h-12 w-12 text-white/80" />
                      </div>
                    )}
                    <h3 className="relative z-10 font-heading font-black text-2xl tracking-tighter text-white text-center px-4 uppercase transform -rotate-2 group-hover:rotate-0 transition-transform duration-500 drop-shadow-2xl">
                      {course.image_text || course.title.substring(0, 10).toUpperCase()}
                    </h3>
                    {!((course as any).is_locked) && (
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                        <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <PlayCircle className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className="px-4 pt-4 pb-2 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${badge.className}`}>
                        {badge.text}
                      </span>
                      <h3 className="font-heading font-bold text-lg tracking-tight leading-tight truncate flex-1">
                        {course.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {course.description || 'Sem descrição'}
                    </p>
                  </CardContent>

                  <CardFooter className="px-4 py-4 bg-transparent border-t border-white/5 mt-auto">
                    {isEnrolled ? (
                      <div className="w-full space-y-1.5">
                        <CourseProgress courseId={course.id} />
                      </div>
                    ) : (course as any).is_locked ? (
                      <Button
                        className="w-full text-xs h-8"
                        onClick={(e) => handlePurchaseClick(e, course.id)}
                      >
                        <Lock className="mr-2 h-3 w-3" />
                        Desbloquear
                      </Button>
                    ) : (
                      <Button
                        className="w-full text-xs h-8"
                        onClick={(e) => handleEnroll(e, course.id)}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Inscrevendo...
                          </>
                        ) : (
                          'Inscrever-se Gratuitamente'
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {hasActiveFilters ? (
            <>
              <p>Nenhum curso encontrado com os filtros atuais.</p>
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Limpar filtros
              </Button>
            </>
          ) : (
            <p>Nenhum curso disponível no momento.</p>
          )}
        </div>
      )}
    </div>
  );
}
