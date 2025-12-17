import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSelectedCommunity } from '@/contexts/community-context';

export interface SearchResult {
  id: string;
  type: 'post' | 'course' | 'user';
  title: string;
  description?: string;
  url: string;
  avatar?: string;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCommunity } = useSelectedCommunity();

  const debouncedQuery = useMemo(() => {
    return query.trim().length >= 2 ? query.trim() : '';
  }, [query]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['search', debouncedQuery, selectedCommunity?.id],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedQuery) return [];

      const searchResults: SearchResult[] = [];

      // Buscar posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, content, course_id')
        .or(`title.ilike.%${debouncedQuery}%,content.ilike.%${debouncedQuery}%`)
        .limit(5);

      if (posts) {
        posts.forEach(post => {
          searchResults.push({
            id: `post-${post.id}`,
            type: 'post',
            title: post.title || 'Post sem título',
            description: post.content?.substring(0, 100) || '',
            url: `/community?post=${post.id}`,
          });
        });
      }

      // Buscar cursos
      const coursesQuery = supabase
        .from('courses')
        .select('id, title, description')
        .or(`title.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`)
        .limit(5);

      if (selectedCommunity?.id) {
        coursesQuery.eq('community_id', selectedCommunity.id);
      }

      const { data: courses } = await coursesQuery;

      if (courses) {
        courses.forEach(course => {
          searchResults.push({
            id: `course-${course.id}`,
            type: 'course',
            title: course.title,
            description: course.description?.substring(0, 100) || '',
            url: `/courses/${course.id}`,
          });
        });
      }

      // Buscar usuários
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, avatar_url')
        .or(`name.ilike.%${debouncedQuery}%,email.ilike.%${debouncedQuery}%`)
        .limit(5);

      if (users) {
        users.forEach(user => {
          searchResults.push({
            id: `user-${user.id}`,
            type: 'user',
            title: user.name || user.email?.split('@')[0] || 'Usuário',
            description: user.email || '',
            url: `/profile/${user.id}`,
            avatar: user.avatar_url || undefined,
          });
        });
      }

      return searchResults;
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  const groupedResults = useMemo(() => {
    const grouped = {
      posts: results.filter(r => r.type === 'post'),
      courses: results.filter(r => r.type === 'course'),
      users: results.filter(r => r.type === 'user'),
    };
    return grouped;
  }, [results]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setIsOpen(false);
  }, []);

  return {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    groupedResults,
    isLoading,
    clearSearch,
    hasResults: results.length > 0,
  };
}
