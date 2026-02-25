import { useQuery } from '@tanstack/react-query';
import { searchGifs, getTrendingGifs } from '@/services/tenor';

export function useGifSearch(query: string) {
  return useQuery({
    queryKey: ['gif-search', query],
    queryFn: () => searchGifs(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrendingGifs() {
  return useQuery({
    queryKey: ['trending-gifs'],
    queryFn: () => getTrendingGifs(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
