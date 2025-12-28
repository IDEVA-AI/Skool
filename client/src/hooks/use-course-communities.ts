import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Hook para buscar as comunidades associadas a um curso
 */
export function useCourseCommunities(courseId: number) {
  return useQuery({
    queryKey: ['course-communities', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_communities')
        .select(`
          id,
          community_id,
          communities (
            id,
            name,
            slug,
            logo_url,
            logo_data,
            logo_mime_type
          )
        `)
        .eq('course_id', courseId);

      if (error) throw error;
      
      // Extrair apenas os dados das comunidades
      return data?.map(item => ({
        id: item.community_id,
        ...item.communities
      })) || [];
    },
    enabled: !!courseId,
  });
}

/**
 * Hook para buscar os IDs das comunidades associadas a um curso
 */
export function useCourseCommunityIds(courseId: number) {
  return useQuery({
    queryKey: ['course-community-ids', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_communities')
        .select('community_id')
        .eq('course_id', courseId);

      if (error) throw error;
      return data?.map(item => item.community_id) || [];
    },
    enabled: !!courseId,
  });
}

/**
 * Hook para atualizar as comunidades de um curso
 * Recebe um array de IDs de comunidades que devem estar associadas
 */
export function useUpdateCourseCommunities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, communityIds }: { courseId: number; communityIds: string[] }) => {
      // Primeiro, buscar as comunidades atuais
      const { data: currentCommunities, error: fetchError } = await supabase
        .from('course_communities')
        .select('community_id')
        .eq('course_id', courseId);

      if (fetchError) throw fetchError;

      const currentIds = currentCommunities?.map(c => c.community_id) || [];

      // Identificar comunidades a adicionar e remover
      const toAdd = communityIds.filter(id => !currentIds.includes(id));
      const toRemove = currentIds.filter(id => !communityIds.includes(id));

      // Remover comunidades que não estão mais na lista
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('course_communities')
          .delete()
          .eq('course_id', courseId)
          .in('community_id', toRemove);

        if (deleteError) throw deleteError;
      }

      // Adicionar novas comunidades
      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('course_communities')
          .insert(
            toAdd.map(communityId => ({
              course_id: courseId,
              community_id: communityId,
            }))
          );

        if (insertError) throw insertError;
      }

      return { added: toAdd, removed: toRemove };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-communities', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-community-ids', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
  });
}

/**
 * Hook para adicionar uma comunidade a um curso
 */
export function useAddCourseCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, communityId }: { courseId: number; communityId: string }) => {
      const { data, error } = await supabase
        .from('course_communities')
        .insert({
          course_id: courseId,
          community_id: communityId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-communities', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-community-ids', variables.courseId] });
    },
  });
}

/**
 * Hook para remover uma comunidade de um curso
 */
export function useRemoveCourseCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, communityId }: { courseId: number; communityId: string }) => {
      const { error } = await supabase
        .from('course_communities')
        .delete()
        .eq('course_id', courseId)
        .eq('community_id', communityId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-communities', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-community-ids', variables.courseId] });
    },
  });
}

