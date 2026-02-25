import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useInstructorStats } from '@/hooks/use-instructor-stats';
import { useIsInstructor } from '@/hooks/use-user-role';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, BookOpen, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

export default function InstructorDashboard() {
  const isInstructor = useIsInstructor();
  const { data: stats, isLoading } = useInstructorStats();

  if (!isInstructor) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Acesso restrito a instrutores</p>
          <Link href="/courses">
            <button className="text-primary hover:underline">Voltar para Cursos</button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
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

  const totalEnrollments = stats?.stats.reduce((sum, s) => sum + s.enrollmentCount, 0) || 0;
  const totalCourses = stats?.courses.length || 0;
  const averageProgress = stats?.stats.length > 0
    ? Math.round(stats.stats.reduce((sum, s) => sum + s.averageProgress, 0) / stats.stats.length)
    : 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Dashboard do Instrutor</h1>
        <p className="text-muted-foreground mt-2">Acompanhe o desempenho dos seus cursos</p>
      </header>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Cursos publicados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground mt-1">Alunos inscritos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <p className="text-xs text-muted-foreground mt-1">Média de conclusão</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Estatísticas por Curso</h2>
        {stats && stats.stats.length > 0 ? (
          <div className="space-y-4">
            {stats.stats.map((stat) => (
              <Card key={stat.courseId}>
                <CardHeader>
                  <CardTitle className="text-lg">{stat.courseTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Alunos Inscritos</span>
                      <span className="font-medium">{stat.enrollmentCount}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progresso Médio</span>
                      <span className="font-medium">{stat.averageProgress}%</span>
                    </div>
                    <Progress value={stat.averageProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Você ainda não tem cursos publicados</p>
              <Link href="/courses">
                <button className="text-primary hover:underline mt-2">Criar seu primeiro curso</button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

