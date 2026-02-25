import { useState, useMemo, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Eye, Loader2, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useAdminCourses, useDeleteCourse, useReorderCourses } from '@/hooks/use-admin-courses';
import { CourseForm } from '@/components/admin/course-form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { DraggableCourseRow } from '@/components/admin/draggable-course-row';
import { DraggableCourseCard } from '@/components/admin/draggable-course-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminCourses() {
  const { data: courses, isLoading } = useAdminCourses();
  const deleteMutation = useDeleteCourse();
  const reorderMutation = useReorderCourses();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);
  const [localCourses, setLocalCourses] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  // Usar cursos locais se houver (para otimistic update), senão usar do servidor
  const displayCourses = useMemo(() => {
    if (localCourses.length > 0) return localCourses;
    return courses || [];
  }, [localCourses, courses]);

  const filteredCourses = displayCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sincronizar cursos locais quando dados do servidor mudarem
  useEffect(() => {
    if (courses) {
      // Inicializar se lista local está vazia
      if (localCourses.length === 0) {
        setLocalCourses(courses);
      }
      // Se o número mudou (criação/deleção), sincronizar
      else if (courses.length !== localCourses.length) {
        setLocalCourses(courses);
      }
    }
  }, [courses]);

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingCourseId) return;

    try {
      await deleteMutation.mutateAsync(deletingCourseId);
      setDeletingCourseId(null);
      // Atualizar lista local
      setLocalCourses(prev => prev.filter(c => c.id !== deletingCourseId));
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível deletar o curso',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = filteredCourses.findIndex((course) => course.id === active.id);
    const newIndex = filteredCourses.findIndex((course) => course.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Criar nova ordem otimisticamente
    const newCourses = [...filteredCourses];
    const [movedCourse] = newCourses.splice(oldIndex, 1);
    newCourses.splice(newIndex, 0, movedCourse);

    // Atualizar UI imediatamente (otimistic update)
    setLocalCourses(newCourses);

    try {
      // Persistir nova ordem no banco
      const courseIds = newCourses.map(course => course.id);
      await reorderMutation.mutateAsync(courseIds);
    } catch (error: any) {
      // Reverter em caso de erro
      setLocalCourses(courses || []);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a ordem',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Cursos</h1>
          <p className="text-muted-foreground mt-2">Crie, edite e gerencie os cursos da plataforma</p>
        </div>
        <Button onClick={() => {
          setEditingCourse(null);
          setIsFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Curso
        </Button>
      </header>

      {/* Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'grid')}>
          <TabsList>
            <TabsTrigger value="table" className="gap-2">
              <TableIcon className="h-4 w-4" />
              Tabela
            </TabsTrigger>
            <TabsTrigger value="grid" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Grid
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Courses Table or Grid */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            {viewMode === 'table' ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : filteredCourses.length > 0 ? (
        viewMode === 'table' ? (
          <Card>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Comunidades</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={filteredCourses.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredCourses.map((course) => (
                      <DraggableCourseRow
                        key={course.id}
                        course={course}
                        onEdit={() => handleEdit(course)}
                        onDelete={() => setDeletingCourseId(course.id)}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </Card>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <SortableContext
                items={filteredCourses.map(c => c.id)}
                strategy={rectSortingStrategy}
              >
                {filteredCourses.map((course, index) => (
                  <DraggableCourseCard
                    key={course.id}
                    course={course}
                    index={index}
                    onEdit={() => handleEdit(course)}
                    onDelete={() => setDeletingCourseId(course.id)}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        )
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-4">
              {searchQuery ? 'Nenhum curso encontrado' : 'Nenhum curso criado ainda'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Curso
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Course Form Modal */}
      <CourseForm
        course={editingCourse}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCourse(null);
        }}
        onSuccess={() => {
          setIsFormOpen(false);
          setEditingCourse(null);
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deletingCourseId !== null} onOpenChange={(open) => !open && setDeletingCourseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este curso? Esta ação não pode ser desfeita e todos os módulos e aulas serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

