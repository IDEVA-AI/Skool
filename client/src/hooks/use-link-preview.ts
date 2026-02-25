import { useQuery } from '@tanstack/react-query';
import { fetchLinkPreview } from '@/services/link-preview';

export function useLinkPreview(url: string | null) {
  return useQuery({
    queryKey: ['link-preview', url],
    queryFn: () => fetchLinkPreview(url!),
    enabled: !!url,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1,
  });
}
