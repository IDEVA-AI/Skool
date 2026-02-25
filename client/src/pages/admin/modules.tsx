import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, ArrowRight } from 'lucide-react';
import { useAdminCourses } from '@/hooks/use-admin-courses';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminModules() {
  const { data: courses, isLoading } = useAdminCourses();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Módulos e Aulas</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie módulos e aulas dos seus cursos
        </p>
      </header>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description || 'Sem descrição'}
                </p>
                <Button asChild className="w-full">
                  <Link href={`/admin/courses/${course.id}`}>
                    Gerenciar Módulos
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum curso encontrado</p>
            <p className="text-sm mb-4">
              Crie um curso primeiro para gerenciar módulos e aulas
            </p>
            <Button asChild>
              <Link href="/admin/courses">Criar Curso</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

