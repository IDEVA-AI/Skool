import { supabase } from '@/lib/supabase';

export interface PollOption {
  id: string;
  poll_id: string;
  text: string;
  order: number;
  vote_count: number;
}

export interface Poll {
  id: string;
  post_id: number;
  question: string;
  closes_at: string | null;
  allow_multiple: boolean;
  options: PollOption[];
  total_votes: number;
  user_votes: string[]; // option IDs the current user voted for
}

/**
 * Get poll by post ID with vote counts and user's votes
 */
export async function getPollByPostId(postId: number): Promise<Poll | null> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: poll, error } = await supabase
    .from('polls')
    .select('*')
    .eq('post_id', postId)
    .maybeSingle();

  if (error) throw error;
  if (!poll) return null;

  // Get options
  const { data: options } = await supabase
    .from('poll_options')
    .select('*')
    .eq('poll_id', poll.id)
    .order('order');

  // Get all votes for this poll
  const { data: allVotes } = await supabase
    .from('poll_votes')
    .select('option_id, user_id')
    .eq('poll_id', poll.id);

  const votes = allVotes || [];
  const optionVoteCounts = new Map<string, number>();
  const userVotes: string[] = [];

  for (const v of votes) {
    optionVoteCounts.set(v.option_id, (optionVoteCounts.get(v.option_id) || 0) + 1);
    if (user && v.user_id === user.id) {
      userVotes.push(v.option_id);
    }
  }

  // Count unique voters
  const uniqueVoters = new Set(votes.map(v => v.user_id));

  return {
    id: poll.id,
    post_id: poll.post_id,
    question: poll.question,
    closes_at: poll.closes_at,
    allow_multiple: poll.allow_multiple,
    options: (options || []).map(o => ({
      ...o,
      vote_count: optionVoteCounts.get(o.id) || 0,
    })),
    total_votes: uniqueVoters.size,
    user_votes: userVotes,
  };
}

/**
 * Vote on a poll option
 */
export async function votePoll(pollId: string, optionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nao autenticado');

  const { error } = await supabase
    .from('poll_votes')
    .insert({ poll_id: pollId, option_id: optionId, user_id: user.id });

  if (error) throw error;
}

/**
 * Remove a poll vote
 */
export async function removePollVote(pollId: string, optionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nao autenticado');

  const { error } = await supabase
    .from('poll_votes')
    .delete()
    .eq('poll_id', pollId)
    .eq('option_id', optionId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Create a poll for a post (called after post creation)
 */
export async function createPoll(
  postId: number,
  question: string,
  options: string[],
  closesAt?: string,
  allowMultiple = false
): Promise<void> {
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({ post_id: postId, question, closes_at: closesAt || null, allow_multiple: allowMultiple })
    .select()
    .single();

  if (pollError) throw pollError;

  const optionInserts = options.map((text, i) => ({
    poll_id: poll.id,
    text,
    order: i,
  }));

  const { error: optError } = await supabase
    .from('poll_options')
    .insert(optionInserts);

  if (optError) throw optError;
}

/**
 * Check if any of the given post IDs have polls
 */
export async function getPostIdsWithPolls(postIds: number[]): Promise<Set<number>> {
  if (postIds.length === 0) return new Set();

  const { data } = await supabase
    .from('polls')
    .select('post_id')
    .in('post_id', postIds);

  return new Set((data || []).map(p => p.post_id));
}
