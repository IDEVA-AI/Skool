import { supabase } from '@/lib/supabase';

export interface PublicProfile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  created_at: string;
  follower_count: number;
  following_count: number;
}

/**
 * Get a public profile by user ID, including follower/following counts
 */
export async function getPublicProfile(userId: string): Promise<PublicProfile> {
  const [userRes, followerCountRes, followingCountRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);

  if (userRes.error) throw userRes.error;

  return {
    ...userRes.data,
    follower_count: followerCountRes.count || 0,
    following_count: followingCountRes.count || 0,
  } as PublicProfile;
}

/**
 * Get posts by a specific user
 */
export async function getPostsByUser(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users:user_id (id, name, email, avatar_url),
      courses:course_id (id, title)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Follow a user
 */
export async function followUser(followingId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nao autenticado');

  const { error } = await supabase
    .from('user_follows')
    .insert({ follower_id: user.id, following_id: followingId });

  if (error) throw error;
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followingId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nao autenticado');

  const { error } = await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId);

  if (error) throw error;
}

/**
 * Check if current user follows a specific user
 */
export async function isFollowing(followingId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('user_follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', followingId)
    .maybeSingle();

  return !!data;
}

/**
 * Search users by name or email
 */
export async function searchUsers(query: string, limit = 10) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, avatar_url')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(limit);

  if (error) throw error;
  return data || [];
}
