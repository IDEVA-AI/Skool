import { supabase } from '@/lib/supabase';

export interface PostReport {
  id: string;
  post_id: number;
  reporter_id: string;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
  description: string | null;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface PostReportWithDetails extends PostReport {
  reporter: { id: string; name: string; avatar_url: string | null } | null;
  post: { id: number; title: string | null; content: string; user_id: string; author_name: string } | null;
}

export async function reportPost(
  postId: number,
  reporterId: string,
  reason: PostReport['reason'],
  description?: string
): Promise<PostReport> {
  const { data, error } = await supabase
    .from('post_reports')
    .insert({
      post_id: postId,
      reporter_id: reporterId,
      reason,
      description: description || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Você já denunciou este post');
    }
    throw error;
  }
  return data;
}

export async function getPendingReports(): Promise<PostReportWithDetails[]> {
  const { data: reports, error } = await supabase
    .from('post_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!reports || reports.length === 0) return [];

  // Batch fetch reporters and posts
  const reporterIds = Array.from(new Set(reports.map(r => r.reporter_id)));
  const postIds = Array.from(new Set(reports.map(r => r.post_id)));

  const [{ data: reporters }, { data: posts }] = await Promise.all([
    supabase.from('users').select('id, name, avatar_url').in('id', reporterIds),
    supabase.from('posts').select('id, title, content, user_id').in('id', postIds),
  ]);

  // Get post author names
  const postUserIds = Array.from(new Set((posts || []).map(p => p.user_id)));
  const { data: postAuthors } = postUserIds.length > 0
    ? await supabase.from('users').select('id, name').in('id', postUserIds)
    : { data: [] };

  const reporterMap = new Map((reporters || []).map(r => [r.id, r]));
  const authorMap = new Map((postAuthors || []).map(a => [a.id, a]));
  const postMap = new Map((posts || []).map(p => [
    p.id,
    { ...p, author_name: authorMap.get(p.user_id)?.name || 'Usuário' }
  ]));

  return reports.map(report => ({
    ...report,
    reporter: reporterMap.get(report.reporter_id) || null,
    post: postMap.get(report.post_id) || null,
  }));
}

export async function getPendingReportsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('post_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) throw error;
  return count || 0;
}

export async function updateReportStatus(
  reportId: string,
  status: 'reviewed' | 'dismissed' | 'actioned',
  reviewerId: string
): Promise<void> {
  const { error } = await supabase
    .from('post_reports')
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) throw error;
}

export async function deletePostByAdmin(postId: number): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) throw error;
}
