import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import type { PostReaction } from './reactions';

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
  reactions?: PostReaction[];
  recent_avatars?: string[];
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

  const postIds = data.map(p => p.id);

  // Batch-fetch comment counts, reactions, and recent commenters in parallel
  const [commentCountsRes, reactionsRes, recentCommentersRes] = await Promise.all([
    supabase.from('comments').select('post_id').in('post_id', postIds),
    supabase.from('post_reactions').select('*').in('post_id', postIds),
    supabase
      .from('comments')
      .select('post_id, users:user_id(avatar_url)')
      .in('post_id', postIds)
      .order('created_at', { ascending: false }),
  ]);

  // Comment count map
  const commentCountMap = new Map<number, number>();
  if (commentCountsRes.data) {
    commentCountsRes.data.forEach(c => {
      commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
    });
  }

  // Reactions map
  const reactionsMap = new Map<number, PostReaction[]>();
  if (reactionsRes.data) {
    for (const r of reactionsRes.data) {
      const list = reactionsMap.get(r.post_id) || [];
      list.push(r as PostReaction);
      reactionsMap.set(r.post_id, list);
    }
  }

  // Recent avatars map (up to 3 distinct commenters per post)
  const recentAvatarsMap = new Map<number, string[]>();
  if (recentCommentersRes.data) {
    for (const c of recentCommentersRes.data) {
      const existing = recentAvatarsMap.get(c.post_id) || [];
      const avatar = (c.users as any)?.avatar_url;
      if (avatar && !existing.includes(avatar) && existing.length < 3) {
        existing.push(avatar);
        recentAvatarsMap.set(c.post_id, existing);
      }
    }
  }

  return data.map(post => ({
    ...post,
    comment_count: commentCountMap.get(post.id) || 0,
    reactions: reactionsMap.get(post.id) || [],
    recent_avatars: recentAvatarsMap.get(post.id) || [],
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

/**
 * Busca posts de usuários que o usuário atual segue
 */
export async function getFollowingPosts(): Promise<PostWithRelations[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get IDs of users the current user follows
  const { data: follows, error: followsError } = await supabase
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', user.id);

  if (followsError) throw followsError;
  if (!follows || follows.length === 0) return [];

  const followingIds = follows.map(f => f.following_id);

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users:user_id (id, name, email, avatar_url),
      courses:course_id (id, title)
    `)
    .in('user_id', followingIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const postIds = data.map(p => p.id);

  const [commentCountsRes, reactionsRes] = await Promise.all([
    supabase.from('comments').select('post_id').in('post_id', postIds),
    supabase.from('post_reactions').select('*').in('post_id', postIds),
  ]);

  const commentCountMap = new Map<number, number>();
  if (commentCountsRes.data) {
    commentCountsRes.data.forEach(c => {
      commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
    });
  }

  const reactionsMap = new Map<number, PostReaction[]>();
  if (reactionsRes.data) {
    for (const r of reactionsRes.data) {
      const list = reactionsMap.get(r.post_id) || [];
      list.push(r as PostReaction);
      reactionsMap.set(r.post_id, list);
    }
  }

  return data.map(post => ({
    ...post,
    comment_count: commentCountMap.get(post.id) || 0,
    reactions: reactionsMap.get(post.id) || [],
  })) as PostWithRelations[];
}

