import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
} from '@/components/ui/accordion';
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
import { Plus, Edit, Trash2, ChevronLeft, Loader2, Mail, Copy, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAdminCourse } from '@/hooks/use-admin-courses';
import { useCourseInvites, useCreateCourseInvite, useDeleteCourseInvite } from '@/hooks/use-course-invites';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  useAdminModules,
  useAdminLessons,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useReorderModules,
  useReorderLessons,
} from '@/hooks/use-admin-modules-lessons';
import { ModuleForm } from '@/components/admin/module-form';
import { LessonForm } from '@/components/admin/lesson-form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableModuleItem } from '@/components/admin/draggable-module-item';
import { DraggableLessonItem } from '@/components/admin/draggable-lesson-item';

export default function AdminCourseDetail() {
  const params = useParams();
  const courseId = parseInt(params.id || '0');
  const { data: course, isLoading: courseLoading } = useAdminCourse(courseId);
  const { data: modules, isLoading: modulesLoading } = useAdminModules(courseId);
  const createModuleMutation = useCreateModule();
  const deleteModuleMutation = useDeleteModule();
  const deleteLessonMutation = useDeleteLesson();
  const { toast } = useToast();

  const [isModuleFormOpen, setIsModuleFormOpen] = useState(false);
  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [deletingModuleId, setDeletingModuleId] = useState<number | null>(null);
  const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [localModules, setLocalModules] = useState<any[]>([]);

  const { data: invites, isLoading: invitesLoading } = useCourseInvites(courseId);
  const createInviteMutation = useCreateCourseInvite();
  const deleteInviteMutation = useDeleteCourseInvite();
  const reorderModulesMutation = useReorderModules();
  const reorderLessonsMutation = useReorderLessons();

  // Usar módulos locais se houver (para otimistic update), senão usar do servidor
  const displayModules = useMemo(() => {
    if (localModules.length > 0) return localModules;
    return modules || [];
  }, [localModules, modules]);

  // Sincronizar módulos locais quando dados do servidor mudarem
  useEffect(() => {
    if (modules) {
      // Inicializar se lista local está vazia
      if (localModules.length === 0) {
        setLocalModules(modules);
      }
      // Se o número mudou (criação/deleção), sincronizar
      else if (modules.length !== localModules.length) {
        setLocalModules(modules);
      }
    }
  }, [modules]);

  const handleCreateModule = () => {
    setEditingModule(null);
    setIsModuleFormOpen(true);
  };

  const handleEditModule = (module: any) => {
    setEditingModule(module);
    setIsModuleFormOpen(true);
  };

  const handleCreateLesson = (moduleId: number) => {
    setSelectedModuleId(moduleId);
    setEditingLesson(null);
    setIsLessonFormOpen(true);
  };

  const handleEditLesson = (lesson: any, moduleId: number) => {
    setSelectedModuleId(moduleId);
    setEditingLesson(lesson);
    setIsLessonFormOpen(true);
  };

  const handleDeleteModule = async () => {
    if (!deletingModuleId) return;

    try {
      await deleteModuleMutation.mutateAsync(deletingModuleId);
      toast({
        title: 'Módulo deletado',
        description: 'O módulo e todas as aulas foram removidos',
      });
      setDeletingModuleId(null);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível deletar o módulo',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLesson = async () => {
    if (!deletingLessonId) return;

    try {
      await deleteLessonMutation.mutateAsync(deletingLessonId);
      toast({
        title: 'Aula deletada',
        description: 'A aula foi removida com sucesso',
      });
      setDeletingLessonId(null);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível deletar a aula',
        variant: 'destructive',
      });
    }
  };

  const handleCreateInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe um email',
        variant: 'destructive',
      });
      return;
    }

    try {
      const invite = await createInviteMutation.mutateAsync({
        courseId,
        email: inviteEmail.trim(),
      });

      toast({
        title: 'Convite criado!',
        description: 'O convite foi criado com sucesso',
      });

      // Copiar link do convite
      const inviteUrl = `${window.location.origin}/course-invite/${invite.token}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedToken(invite.token);
      
      setTimeout(() => {
        setCopiedToken(null);
      }, 2000);

      setInviteEmail('');
      setIsInviteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar o convite',
        variant: 'destructive',
      });
    }
  };

  const handleCopyInviteLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/course-invite/${token}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(token);
    toast({
      title: 'Link copiado!',
      description: 'O link do convite foi copiado para a área de transferência',
    });
    setTimeout(() => {
      setCopiedToken(null);
    }, 2000);
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await deleteInviteMutation.mutateAsync({ inviteId, courseId });
      toast({
        title: 'Convite deletado',
        description: 'O convite foi removido com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível deletar o convite',
        variant: 'destructive',
      });
    }
  };

  const handleModulesDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = displayModules.findIndex((module) => module.id === active.id);
    const newIndex = displayModules.findIndex((module) => module.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Criar nova ordem otimisticamente
    const newModules = [...displayModules];
    const [movedModule] = newModules.splice(oldIndex, 1);
    newModules.splice(newIndex, 0, movedModule);

    // Atualizar UI imediatamente (otimistic update)
    setLocalModules(newModules);

    try {
      // Persistir nova ordem no banco
      const moduleIds = newModules.map(module => module.id);
      await reorderModulesMutation.mutateAsync({ courseId, moduleIds });
      
      toast({
        title: 'Ordem atualizada',
        description: 'A ordem dos módulos foi salva com sucesso',
      });
    } catch (error: any) {
      // Reverter em caso de erro
      setLocalModules(modules || []);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a ordem dos módulos',
        variant: 'destructive',
      });
    }
  };

  if (courseLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Curso não encontrado</p>
        <Link href="/admin/courses">
          <Button>Voltar para Cursos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
            {course.description && (
              <p className="text-muted-foreground mt-1">{course.description}</p>
            )}
          </div>
        </div>
        <Button onClick={handleCreateModule}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Módulo
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="invites">Convites</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          {/* Modules List */}
          {modulesLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : displayModules && displayModules.length > 0 ? (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleModulesDragEnd}>
              <Accordion type="single" collapsible className="w-full">
                <SortableContext
                  items={displayModules.map(m => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {displayModules.map((module) => (
                    <DraggableModuleWrapper
                      key={module.id}
                      module={module}
                      courseId={courseId}
                      onEdit={() => handleEditModule(module)}
                      onDelete={() => setDeletingModuleId(module.id)}
                      onCreateLesson={() => handleCreateLesson(module.id)}
                      onEditLesson={(lesson) => handleEditLesson(lesson, module.id)}
                      onDeleteLesson={(lessonId) => setDeletingLessonId(lessonId)}
                    />
                  ))}
                </SortableContext>
              </Accordion>
            </DndContext>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="mb-4">Nenhum módulo criado ainda</p>
                <Button onClick={handleCreateModule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Módulo
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invites" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Convites do Curso</CardTitle>
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Convite
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {invitesLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : invites && invites.length > 0 ? (
                <div className="space-y-2">
                  {invites.map((invite) => {
                    const isExpired = invite.expires_at && new Date(invite.expires_at) < new Date();
                    const isAccepted = !!invite.accepted_at;
                    const inviteUrl = `${window.location.origin}/course-invite/${invite.token}`;

                    return (
                      <Card key={invite.id} className="border-zinc-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{invite.email}</span>
                                {isAccepted ? (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Aceito
                                  </span>
                                ) : isExpired ? (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
                                    <XCircle className="h-3 w-3" />
                                    Expirado
                                  </span>
                                ) : (
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Pendente
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p>Criado em: {new Date(invite.created_at).toLocaleDateString('pt-BR')}</p>
                                {invite.expires_at && (
                                  <p>Expira em: {new Date(invite.expires_at).toLocaleDateString('pt-BR')}</p>
                                )}
                                {invite.accepted_at && (
                                  <p>Aceito em: {new Date(invite.accepted_at).toLocaleDateString('pt-BR')}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Input
                                  value={inviteUrl}
                                  readOnly
                                  className="text-xs font-mono h-8"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleCopyInviteLink(invite.token)}
                                >
                                  {copiedToken === invite.token ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            {!isAccepted && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteInvite(invite.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Nenhum convite criado ainda</p>
                  <Button onClick={() => setIsInviteDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Convite
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Convite</DialogTitle>
            <DialogDescription>
              Envie um convite por email para dar acesso ao curso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={createInviteMutation.isPending}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsInviteDialogOpen(false);
                  setInviteEmail('');
                }}
                disabled={createInviteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateInvite}
                disabled={createInviteMutation.isPending}
              >
                {createInviteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Criar Convite
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Module Form */}
      <ModuleForm
        courseId={courseId}
        module={editingModule}
        isOpen={isModuleFormOpen}
        onClose={() => {
          setIsModuleFormOpen(false);
          setEditingModule(null);
        }}
        onSuccess={() => {
          setIsModuleFormOpen(false);
          setEditingModule(null);
        }}
      />

      {/* Lesson Form */}
      {selectedModuleId && (
        <LessonForm
          moduleId={selectedModuleId}
          lesson={editingLesson}
          isOpen={isLessonFormOpen}
          onClose={() => {
            setIsLessonFormOpen(false);
            setEditingLesson(null);
            setSelectedModuleId(null);
          }}
          onSuccess={() => {
            setIsLessonFormOpen(false);
            setEditingLesson(null);
            setSelectedModuleId(null);
          }}
        />
      )}

      {/* Delete Module Confirmation */}
      <AlertDialog open={deletingModuleId !== null} onOpenChange={(open) => !open && setDeletingModuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este módulo? Todas as aulas serão removidas também.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModule}
              className="bg-destructive text-destructive-foreground"
              disabled={deleteModuleMutation.isPending}
            >
              {deleteModuleMutation.isPending ? (
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

      {/* Delete Lesson Confirmation */}
      <AlertDialog open={deletingLessonId !== null} onOpenChange={(open) => !open && setDeletingLessonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta aula?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLesson}
              className="bg-destructive text-destructive-foreground"
              disabled={deleteLessonMutation.isPending}
            >
              {deleteLessonMutation.isPending ? (
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

function DraggableModuleWrapper({
  module,
  courseId,
  onEdit,
  onDelete,
  onCreateLesson,
  onEditLesson,
  onDeleteLesson,
}: {
  module: any;
  courseId: number;
  onEdit: () => void;
  onDelete: () => void;
  onCreateLesson: () => void;
  onEditLesson: (lesson: any) => void;
  onDeleteLesson: (lessonId: number) => void;
}) {
  const { data: lessons, isLoading } = useAdminLessons(module.id);
  const reorderLessonsMutation = useReorderLessons();
  const { toast } = useToast();
  const [localLessons, setLocalLessons] = useState<any[]>([]);

  // Usar aulas locais se houver (para otimistic update), senão usar do servidor
  const displayLessons = useMemo(() => {
    if (localLessons.length > 0) return localLessons;
    return lessons || [];
  }, [localLessons, lessons]);

  // Sincronizar aulas locais quando dados do servidor mudarem
  useEffect(() => {
    if (lessons) {
      // Inicializar se lista local está vazia
      if (localLessons.length === 0) {
        setLocalLessons(lessons);
      }
      // Se o número mudou (criação/deleção), sincronizar
      else if (lessons.length !== localLessons.length) {
        setLocalLessons(lessons);
      }
    }
  }, [lessons]);

  const handleLessonsDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = displayLessons.findIndex((lesson) => lesson.id === active.id);
    const newIndex = displayLessons.findIndex((lesson) => lesson.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Criar nova ordem otimisticamente
    const newLessons = [...displayLessons];
    const [movedLesson] = newLessons.splice(oldIndex, 1);
    newLessons.splice(newIndex, 0, movedLesson);

    // Atualizar UI imediatamente (otimistic update)
    setLocalLessons(newLessons);

    try {
      // Persistir nova ordem no banco
      const lessonIds = newLessons.map(lesson => lesson.id);
      await reorderLessonsMutation.mutateAsync({ moduleId: module.id, lessonIds });
      
      toast({
        title: 'Ordem atualizada',
        description: 'A ordem das aulas foi salva com sucesso',
      });
    } catch (error: any) {
      // Reverter em caso de erro
      setLocalLessons(lessons || []);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a ordem das aulas',
        variant: 'destructive',
      });
    }
  };

  return (
    <DraggableModuleItem
      module={module}
      lessonsCount={displayLessons.length}
      onEdit={onEdit}
      onDelete={onDelete}
      onCreateLesson={onCreateLesson}
    >
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : displayLessons && displayLessons.length > 0 ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleLessonsDragEnd}>
          <SortableContext
            items={displayLessons.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {displayLessons.map((lesson) => (
                <DraggableLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={() => onEditLesson(lesson)}
                  onDelete={() => onDeleteLesson(lesson.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <p>Nenhuma aula criada ainda</p>
          <Button variant="outline" size="sm" onClick={onCreateLesson} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Aula
          </Button>
        </div>
      )}
    </DraggableModuleItem>
  );
}

