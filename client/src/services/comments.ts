import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Comment = Database['public']['Tables']['comments']['Row'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];
type CommentUpdate = Database['public']['Tables']['comments']['Update'];

export interface CommentWithUser extends Comment {
  users: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

/**
 * Busca comentários de um post
 */
export async function getCommentsByPost(postId: number): Promise<CommentWithUser[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      users:user_id (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as CommentWithUser[];
}

/**
 * Cria um novo comentário
 */
export async function createComment(
  data: Omit<CommentInsert, 'user_id' | 'created_at' | 'updated_at' | 'parent_id'> & { parentId?: number }
): Promise<Comment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { parentId, ...commentData } = data;

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      ...commentData,
      user_id: user.id,
      parent_id: parentId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return comment;
}

/**
 * Atualiza um comentário existente
 * Valida permissões (apenas dono ou admin pode editar)
 */
export async function updateComment(
  commentId: number,
  content: string
): Promise<Comment & { post_id: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Verificar se o comentário pertence ao usuário ou se é admin
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id, post_id')
    .eq('id', commentId)
    .single();

  if (!comment) throw new Error('Comentário não encontrado');

  // Verificar se é admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = userData?.role === 'admin';
  
  // Apenas o dono ou admin pode editar
  if (comment.user_id !== user.id && !isAdmin) {
    throw new Error('Você não tem permissão para editar este comentário');
  }

  const { data, error } = await supabase
    .from('comments')
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return { ...data, post_id: comment.post_id };
}

/**
 * Deleta um comentário
 * Valida permissões (apenas dono ou admin pode deletar)
 */
export async function deleteComment(commentId: number): Promise<{ postId: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Verificar se o comentário pertence ao usuário ou se é admin
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id, post_id')
    .eq('id', commentId)
    .single();

  if (!comment) throw new Error('Comentário não encontrado');

  // Verificar se é admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = userData?.role === 'admin';
  
  // Apenas o dono ou admin pode deletar
  if (comment.user_id !== user.id && !isAdmin) {
    throw new Error('Você não tem permissão para deletar este comentário');
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
  return { postId: comment.post_id };
}

