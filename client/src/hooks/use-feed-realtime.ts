import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UseFeedRealtimeOptions {
  courseIds: number[];
  enabled?: boolean;
}

/**
 * Subscribes to Supabase Realtime for new posts.
 * Filters client-side by courseIds (Realtime doesn't support IN filters).
 */
export function useFeedRealtime({ courseIds, enabled = true }: UseFeedRealtimeOptions) {
  const [newPostCount, setNewPostCount] = useState(0);
  const [hasNewPosts, setHasNewPosts] = useState(false);

  useEffect(() => {
    if (!enabled || courseIds.length === 0) return;

    const channel = supabase
      .channel('feed-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          const newPost = payload.new as any;
          // Filter client-side by enrolled course IDs
          if (courseIds.includes(newPost.course_id)) {
            setNewPostCount(prev => prev + 1);
            setHasNewPosts(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseIds, enabled]);

  const dismissNewPosts = useCallback(() => {
    setNewPostCount(0);
    setHasNewPosts(false);
  }, []);

  return { hasNewPosts, newPostCount, dismissNewPosts };
}
