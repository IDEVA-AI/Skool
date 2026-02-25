import { useQuery } from '@tanstack/react-query';
import * as hashtagsService from '@/services/hashtags';

export function useTrendingHashtags(limit = 10) {
  return useQuery({
    queryKey: ['trending-hashtags', limit],
    queryFn: () => hashtagsService.getTrendingHashtags(limit),
  });
}

export function usePostsByHashtag(tagName: string | undefined) {
  return useQuery({
    queryKey: ['hashtag-posts', tagName],
    queryFn: () => hashtagsService.getPostsByHashtag(tagName!),
    enabled: !!tagName,
  });
}

export function useHashtagSearch(query: string) {
  return useQuery({
    queryKey: ['hashtag-search', query],
    queryFn: () => hashtagsService.searchHashtags(query),
    enabled: query.length >= 1,
  });
}
