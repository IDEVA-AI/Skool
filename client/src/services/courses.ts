import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Course = Database['public']['Tables']['courses']['Row'];
type CourseInsert = Database['public']['Tables']['courses']['Insert'];
type CourseUpdate = Database['public']['Tables']['courses']['Update'];

export interface CourseWithImage extends Course {
  cover_image_data?: string | null;
  cover_image_mime_type?: string | null;
}

/**
 * Busca todos os cursos
 */
export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Busca cursos de uma comunidade específica (usando tabela de relacionamento N:N)
 */
export async function getCoursesByCommunity(communityId: string): Promise<Course[]> {
  // Buscar IDs de cursos associados à comunidade
  const { data: relations, error: relError } = await supabase
    .from('course_communities')
    .select('course_id')
    .eq('community_id', communityId);

  if (relError) throw relError;
  if (!relations || relations.length === 0) return [];

  const courseIds = relations.map(r => r.course_id);

  // Buscar os cursos correspondentes
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .in('id', courseIds)
    .order('order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Busca um curso específico por ID
 */
export async function getCourseById(courseId: number): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

/**
 * Busca cursos em que o usuário está inscrito
 */
export async function getEnrolledCourses(): Promise<number[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('user_id', user.id);

  if (error) throw error;
  return data.map(e => e.course_id);
}

/**
 * Verifica se o usuário está inscrito em um curso
 */
export async function isEnrolled(courseId: number): Promise<boolean> {
  const enrolledIds = await getEnrolledCourses();
  return enrolledIds.includes(courseId);
}

/**
 * Inscreve o usuário em um curso
 * Valida se o curso está bloqueado antes de inscrever
 */
export async function enrollInCourse(courseId: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Verificar se o curso está bloqueado
  const course = await getCourseById(courseId);
  if (!course) throw new Error('Curso não encontrado');
  
  if (course.is_locked) {
    throw new Error('Este curso está bloqueado. É necessário comprar ou receber um convite para acessar.');
  }

  const { error } = await supabase
    .from('enrollments')
    .insert({ user_id: user.id, course_id: courseId });

  if (error) throw error;
}

/**
 * Busca ou cria um curso padrão para a comunidade
 * Esta é uma regra de negócio que deveria estar no backend
 */
export async function getOrCreateDefaultCourse(communityId: string): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Primeiro, tenta encontrar um curso padrão existente para a comunidade
  const { data: existingCourses, error: searchError } = await supabase
    .from('courses')
    .select('id')
    .eq('community_id', communityId)
    .limit(1);

  if (searchError) throw searchError;

  // Se já existe um curso na comunidade, retorna o primeiro
  if (existingCourses && existingCourses.length > 0) {
    return existingCourses[0].id;
  }

  // Se não existe, cria um curso padrão "Geral" para a comunidade
  const { data: newCourse, error: createError } = await supabase
    .from('courses')
    .insert({
      title: 'Geral',
      description: 'Curso padrão para postagens na comunidade',
      community_id: communityId,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (createError) throw createError;
  
  // Inscreve automaticamente o usuário no curso padrão
  await enrollInCourse(newCourse.id);

  return newCourse.id;
}

/**
 * Cria um novo curso
 */
export async function createCourse(courseData: Omit<CourseInsert, 'created_at' | 'updated_at'>): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .insert(courseData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Atualiza um curso existente
 */
export async function updateCourse(
  courseId: number,
  courseUpdates: Omit<CourseUpdate, 'updated_at'>
): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .update({
      ...courseUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deleta um curso
 */
export async function deleteCourse(courseId: number): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) throw error;
}

/**
 * Helper para obter URL da imagem de capa (prioriza data, depois url)
 */
export function getCourseCoverImageUrl(course: CourseWithImage | null | undefined): string | null {
  if (!course) return null;
  if (course.cover_image_data) {
    return `data:${course.cover_image_mime_type || 'image/png'};base64,${course.cover_image_data}`;
  }
  return course.cover_image_url;
}

