import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CourseInvite {
  id: string;
  course_id: number;
  email: string;
  token: string;
  invited_by: string;
  accepted_at: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface CourseInviteWithCourse extends CourseInvite {
  courses: {
    id: number;
    title: string;
    description: string | null;
  } | null;
}

/**
 * Busca convites de um curso específico
 */
export function useCourseInvites(courseId: number) {
  return useQuery({
    queryKey: ['course-invites', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_invites')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CourseInvite[];
    },
    enabled: !!courseId,
  });
}

/**
 * Busca um convite específico por token
 */
export function useCourseInviteByToken(token: string) {
  return useQuery({
    queryKey: ['course-invite', token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_invites')
        .select(`
          *,
          courses:course_id (
            id,
            title,
            description,
            is_locked
          )
        `)
        .eq('token', token)
        .single();

      if (error) throw error;
      return data as CourseInviteWithCourse;
    },
    enabled: !!token,
  });
}

/**
 * Cria um novo convite para um curso
 */
export function useCreateCourseInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, email, expiresAt }: { courseId: number; email: string; expiresAt?: Date }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Gerar token único
      const token = crypto.randomUUID();

      const { data, error } = await supabase
        .from('course_invites')
        .insert({
          course_id: courseId,
          email: email.toLowerCase().trim(),
          token,
          invited_by: user.id,
          expires_at: expiresAt?.toISOString() || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CourseInvite;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course-invites', data.course_id] });
    },
  });
}

/**
 * Aceita um convite de curso
 */
export function useAcceptCourseInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar o convite
      const { data: invite, error: inviteError } = await supabase
        .from('course_invites')
        .select('*, courses:course_id(*)')
        .eq('token', token)
        .single();

      if (inviteError) throw inviteError;
      if (!invite) throw new Error('Convite não encontrado');

      // Verificar se já foi aceito
      if (invite.accepted_at) {
        throw new Error('Este convite já foi aceito');
      }

      // Verificar se expirou
      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        throw new Error('Este convite expirou');
      }

      // Verificar se o email corresponde
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.email?.toLowerCase() !== invite.email.toLowerCase()) {
        throw new Error('Este convite foi enviado para outro email');
      }

      // Criar enrollment
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: invite.course_id,
        });

      if (enrollError) {
        // Se já está inscrito, apenas marca o convite como aceito
        if (enrollError.code === '23505') {
          // Violação de constraint única (já inscrito)
        } else {
          throw enrollError;
        }
      }

      // Marcar convite como aceito
      const { error: updateError } = await supabase
        .from('course_invites')
        .update({ accepted_at: new Date().toISOString() })
        .eq('token', token);

      if (updateError) throw updateError;

      return invite.course_id as number;
    },
    onSuccess: (courseId) => {
      queryClient.invalidateQueries({ queryKey: ['course-invites'] });
      queryClient.invalidateQueries({ queryKey: ['course-invite'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Deleta um convite
 */
export function useDeleteCourseInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inviteId, courseId }: { inviteId: string; courseId: number }) => {
      const { error } = await supabase
        .from('course_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-invites', variables.courseId] });
    },
  });
}

/**
 * Verifica se o usuário tem acesso a um curso (via enrollment ou convite aceito)
 */
export function useHasCourseAccess(courseId: number) {
  return useQuery({
    queryKey: ['course-access', courseId],
    queryFn: async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return false;

      // Verificar enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('course_id', courseId)
        .single();

      if (enrollment) return true;

      // Verificar se tem convite aceito
      const { data: invite } = await supabase
        .from('course_invites')
        .select('id')
        .eq('course_id', courseId)
        .eq('email', currentUser.email)
        .not('accepted_at', 'is', null)
        .single();

      return !!invite;
    },
    enabled: !!courseId,
  });
}

