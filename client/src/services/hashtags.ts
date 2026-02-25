import { supabase } from '@/lib/supabase';

export interface Hashtag {
  id: number;
  name: string;
  post_count: number;
}

/**
 * Get trending hashtags ordered by post count
 */
export async function getTrendingHashtags(limit = 10): Promise<Hashtag[]> {
  const { data, error } = await supabase
    .from('hashtags')
    .select('*')
    .gt('post_count', 0)
    .order('post_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as Hashtag[];
}

/**
 * Get posts by hashtag name
 */
export async function getPostsByHashtag(tagName: string) {
  const { data: hashtag } = await supabase
    .from('hashtags')
    .select('id')
    .eq('name', tagName.toLowerCase())
    .maybeSingle();

  if (!hashtag) return [];

  const { data: postHashtags } = await supabase
    .from('post_hashtags')
    .select('post_id')
    .eq('hashtag_id', hashtag.id);

  if (!postHashtags || postHashtags.length === 0) return [];

  const postIds = postHashtags.map(ph => ph.post_id);

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      users:user_id (id, name, email, avatar_url),
      courses:course_id (id, title)
    `)
    .in('id', postIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Search hashtags by partial name
 */
export async function searchHashtags(query: string, limit = 10): Promise<Hashtag[]> {
  const { data, error } = await supabase
    .from('hashtags')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('post_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as Hashtag[];
}
