import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, PlayCircle, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useCourses, getCourseCoverImageUrl } from "@/hooks/use-courses";
import { useEnrollments, useEnrollInCourse } from "@/hooks/use-courses";
import { useCourseProgress } from "@/hooks/use-course-content";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: enrolledCourseIds = [] } = useEnrollments();
  const enrollMutation = useEnrollInCourse();

  const enrolledCourses = courses?.filter(c => enrolledCourseIds.includes(c.id)) || [];
  const availableCourses = courses?.filter(c => !enrolledCourseIds.includes(c.id)) || [];

  const currentUser = user ? {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
  } : null;

  if (coursesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {currentUser?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Continue aprendendo e explore novos cursos
        </p>
      </div>

      {/* Continuar Estudando */}
      {enrolledCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Continuar Estudando</h2>
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="text-gray-600">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.slice(0, 3).map((course) => {
              const CourseProgress = () => {
                const { progress } = useCourseProgress(course.id);
                return (
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progresso</span>
                          <span className="font-medium text-gray-900">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <Link href={`/courses/${course.id}`}>
                          <Button className="w-full" size="sm">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Continuar
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              };
              return <CourseProgress key={course.id} />;
            })}
          </div>
        </div>
      )}

      {/* Cursos Disponíveis */}
      {availableCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Cursos Disponíveis</h2>
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="text-gray-600">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.slice(0, 6).map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                {getCourseCoverImageUrl(course) && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
                    <img
                      src={getCourseCoverImageUrl(course)!}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  {course.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                      {course.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={async () => {
                      try {
                        await enrollMutation.mutateAsync(course.id);
                      } catch (error) {
                        console.error(error);
                      }
                    }}
                    disabled={enrollMutation.isPending}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Inscrever-se
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {enrolledCourses.length === 0 && availableCourses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum curso disponível
            </h3>
            <p className="text-gray-600 mb-4">
              Os cursos serão exibidos aqui quando estiverem disponíveis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

