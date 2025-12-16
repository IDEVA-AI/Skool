import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useAdminModules(courseId: number) {
  return useQuery({
    queryKey: ['admin-modules', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
}

export function useAdminLessons(moduleId: number) {
  return useQuery({
    queryKey: ['admin-lessons', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!moduleId,
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleData: {
      course_id: number;
      title: string;
      order?: number;
    }) => {
      // Se não especificar order, buscar o próximo número
      if (moduleData.order === undefined) {
        const { data: existingModules } = await supabase
          .from('modules')
          .select('order')
          .eq('course_id', moduleData.course_id)
          .order('order', { ascending: false })
          .limit(1);

        moduleData.order = existingModules && existingModules.length > 0
          ? existingModules[0].order + 1
          : 0;
      }

      const { data, error } = await supabase
        .from('modules')
        .insert(moduleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules', variables.course_id] });
      queryClient.invalidateQueries({ queryKey: ['modules', variables.course_id] });
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...moduleData }: {
      id: number;
      title?: string;
      order?: number;
      course_id?: number;
    }) => {
      const { data, error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules', data.course_id] });
      queryClient.invalidateQueries({ queryKey: ['modules', data.course_id] });
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleId: number) => {
      // Buscar course_id antes de deletar
      const { data: module } = await supabase
        .from('modules')
        .select('course_id')
        .eq('id', moduleId)
        .single();

      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;
      return module?.course_id;
    },
    onSuccess: (courseId) => {
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ['admin-modules', courseId] });
        queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      }
    },
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonData: {
      module_id: number;
      title: string;
      video_embed_url?: string | null;
      description?: string | null;
      duration?: number | null;
      order?: number;
    }) => {
      // Se não especificar order, buscar o próximo número
      if (lessonData.order === undefined) {
        const { data: existingLessons } = await supabase
          .from('lessons')
          .select('order')
          .eq('module_id', lessonData.module_id)
          .order('order', { ascending: false })
          .limit(1);

        lessonData.order = existingLessons && existingLessons.length > 0
          ? existingLessons[0].order + 1
          : 0;
      }

      const { data, error } = await supabase
        .from('lessons')
        .insert(lessonData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', variables.module_id] });
      queryClient.invalidateQueries({ queryKey: ['lessons', variables.module_id] });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...lessonData }: {
      id: number;
      title?: string;
      video_embed_url?: string | null;
      description?: string | null;
      duration?: number | null;
      order?: number;
      module_id?: number;
    }) => {
      const { data, error } = await supabase
        .from('lessons')
        .update(lessonData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', data.module_id] });
      queryClient.invalidateQueries({ queryKey: ['lessons', data.module_id] });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: number) => {
      // Buscar module_id antes de deletar
      const { data: lesson } = await supabase
        .from('lessons')
        .select('module_id')
        .eq('id', lessonId)
        .single();

      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;
      return lesson?.module_id;
    },
    onSuccess: (moduleId) => {
      if (moduleId) {
        queryClient.invalidateQueries({ queryKey: ['admin-lessons', moduleId] });
        queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] });
      }
    },
  });
}

/**
 * Reordena módulos atualizando o campo order
 * Recebe um array de IDs na nova ordem para um curso específico
 */
export function useReorderModules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, moduleIds }: { courseId: number; moduleIds: number[] }) => {
      // Criar array de updates com a nova ordem
      const updates = moduleIds.map((id, index) => ({
        id,
        order: index + 1,
      }));

      // Executar updates em batch usando Promise.all
      const updatePromises = updates.map(({ id, order }) =>
        supabase
          .from('modules')
          .update({ order })
          .eq('id', id)
      );

      const results = await Promise.all(updatePromises);
      
      // Verificar se algum update falhou
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Erro ao reordenar módulos: ${errors[0].error?.message}`);
      }

      return { courseId, moduleIds };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules', data.courseId] });
      queryClient.invalidateQueries({ queryKey: ['modules', data.courseId] });
    },
  });
}

/**
 * Reordena aulas atualizando o campo order
 * Recebe um array de IDs na nova ordem para um módulo específico
 */
export function useReorderLessons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moduleId, lessonIds }: { moduleId: number; lessonIds: number[] }) => {
      // Criar array de updates com a nova ordem
      const updates = lessonIds.map((id, index) => ({
        id,
        order: index + 1,
      }));

      // Executar updates em batch usando Promise.all
      const updatePromises = updates.map(({ id, order }) =>
        supabase
          .from('lessons')
          .update({ order })
          .eq('id', id)
      );

      const results = await Promise.all(updatePromises);
      
      // Verificar se algum update falhou
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Erro ao reordenar aulas: ${errors[0].error?.message}`);
      }

      return { moduleId, lessonIds };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-lessons', data.moduleId] });
      queryClient.invalidateQueries({ queryKey: ['lessons', data.moduleId] });
    },
  });
}

