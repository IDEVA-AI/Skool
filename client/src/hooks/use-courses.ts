import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as coursesService from '@/services/courses';

// Tipo para curso com campos de imagem
export interface Course {
  id: number;
  title: string;
  description: string | null;
  created_by: string | null;
  community_id: string | null;
  community_slug: string | null;
  cover_image_url: string | null;
  cover_image_data: string | null;
  cover_image_mime_type: string | null;
  image_text: string | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

// Re-export helper function from service
export { getCourseCoverImageUrl } from '@/services/courses';

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesService.getAllCourses(),
  });
}

/**
 * Hook para buscar cursos de uma comunidade específica
 * Usa a tabela de relacionamento N:N (course_communities)
 */
export function useCoursesByCommunity(communityId: string | null | undefined) {
  return useQuery({
    queryKey: ['courses', 'by-community', communityId],
    queryFn: () => coursesService.getCoursesByCommunity(communityId!),
    enabled: !!communityId,
  });
}

export function useCourse(courseId: number) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesService.getCourseById(courseId),
    enabled: !!courseId,
  });
}

export function useEnrollments() {
  return useQuery({
    queryKey: ['enrollments'],
    queryFn: () => coursesService.getEnrolledCourses(),
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: number) => coursesService.enrollInCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useIsEnrolled(courseId: number) {
  const { data: enrolledCourseIds } = useEnrollments();
  return enrolledCourseIds?.includes(courseId) ?? false;
}

/**
 * Busca ou cria um curso padrão para a comunidade.
 * Este curso é usado para permitir postagens na comunidade mesmo quando não há cursos criados.
 */
export function useGetOrCreateDefaultCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (communityId: string) => coursesService.getOrCreateDefaultCourse(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

