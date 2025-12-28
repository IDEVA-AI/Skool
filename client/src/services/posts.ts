import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Post = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];

export interface PostWithRelations extends Post {
  users: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
  courses: {
    id: number;
    title: string;
  };
  comment_count?: number;
}

export interface PostWithUser extends Post {
  users: {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

/**
 * Busca todos os posts dos cursos em que o usuário está inscrito
 */
export async function getAllPosts(): Promise<PostWithRelations[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Buscar cursos em que o usuário está inscrito
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('user_id', user.id);

  if (enrollmentsError) throw enrollmentsError;
  if (!enrollments || enrollments.length === 0) return [];

  const courseIds = enrollments.map(e => e.course_id);

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users:user_id (
        id,
        name,
        email,
        avatar_url
      ),
      courses:course_id (
        id,
        title
      )
    `)
    .in('course_id', courseIds)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Buscar contagem de comentários para cada post
  const postIds = data.map(p => p.id);
  const { data: commentCounts } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', postIds);

  // Criar um mapa de contagem de comentários por post
  const commentCountMap = new Map<number, number>();
  if (commentCounts) {
    commentCounts.forEach(comment => {
      const count = commentCountMap.get(comment.post_id) || 0;
      commentCountMap.set(comment.post_id, count + 1);
    });
  }

  // Adicionar comment_count a cada post
  return data.map(post => ({
    ...post,
    comment_count: commentCountMap.get(post.id) || 0,
  })) as PostWithRelations[];
}

/**
 * Busca posts de um curso específico
 */
export async function getPostsByCourse(courseId: number): Promise<PostWithUser[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users:user_id (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq('course_id', courseId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as PostWithUser[];
}

/**
 * Cria um novo post
 */
export async function createPost(data: Omit<PostInsert, 'user_id' | 'created_at' | 'updated_at'>): Promise<Post> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      ...data,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return post;
}

/**
 * Atualiza um post existente
 */
export async function updatePost(
  postId: number,
  updates: Omit<PostUpdate, 'updated_at'>
): Promise<PostWithRelations> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('posts')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)
    .select(`
      *,
      users:user_id (
        id,
        name,
        email,
        avatar_url
      ),
      courses:course_id (
        id,
        title
      )
    `)
    .single();

  if (error) throw error;
  return data as PostWithRelations;
}

/**
 * Deleta um post
 */
export async function deletePost(postId: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}

/**
 * Fixa um post
 */
export async function pinPost(postId: number): Promise<PostWithRelations> {
  return updatePost(postId, { pinned: true });
}

/**
 * Desfixa um post
 */
export async function unpinPost(postId: number): Promise<PostWithRelations> {
  return updatePost(postId, { pinned: false });
}

