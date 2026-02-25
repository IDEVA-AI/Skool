import { useLinkPreview } from '@/hooks/use-link-preview';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LinkPreviewCardProps {
  url: string;
}

export function LinkPreviewCard({ url }: LinkPreviewCardProps) {
  const { data: preview, isLoading } = useLinkPreview(url);

  if (isLoading) {
    return (
      <Card className="mt-3 overflow-hidden">
        <div className="flex gap-3 p-3">
          <Skeleton className="h-16 w-16 rounded shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (!preview || (!preview.title && !preview.description)) return null;

  const domain = (() => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  })();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-3"
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="overflow-hidden hover:bg-muted/30 transition-colors border-border/50">
        <div className="flex">
          {preview.image && (
            <div className="shrink-0 w-24 h-24 bg-muted">
              <img
                src={preview.image}
                alt={preview.title || ''}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1 p-3 min-w-0">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
              <ExternalLink className="h-2.5 w-2.5" />
              <span>{preview.siteName || domain}</span>
            </div>
            {preview.title && (
              <h4 className="text-sm font-medium line-clamp-1">{preview.title}</h4>
            )}
            {preview.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{preview.description}</p>
            )}
          </div>
        </div>
      </Card>
    </a>
  );
}
