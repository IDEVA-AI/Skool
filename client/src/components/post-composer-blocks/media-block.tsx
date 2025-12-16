import { Image, Video, Link as LinkIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostBlock } from '@/types/social';
import { cn } from '@/lib/utils';

interface MediaBlockProps {
  block: PostBlock;
  onRemove?: (blockId: string) => void;
  className?: string;
}

export function MediaBlock({ block, onRemove, className }: MediaBlockProps) {
  const renderContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: block.content }} />
          </div>
        );

      case 'image':
        return (
          <div className="relative group">
            <img
              src={block.metadata?.url || block.content}
              alt={block.metadata?.alt || 'Imagem'}
              className={cn(
                'w-full rounded-lg object-cover',
                block.metadata?.height && `max-h-[${block.metadata.height}px]`
              )}
            />
            {onRemove && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(block.id)}
                aria-label="Remover imagem"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="relative group">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              {block.metadata?.thumbnail ? (
                <img
                  src={block.metadata.thumbnail}
                  alt="Thumbnail do vídeo"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Video className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            {block.metadata?.url && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-3">
                  <Video className="h-8 w-8 text-white" />
                </div>
              </div>
            )}
            {onRemove && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(block.id)}
                aria-label="Remover vídeo"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );

      case 'link':
        return (
          <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors group">
            <div className="flex items-start gap-3">
              {block.metadata?.thumbnail && (
                <img
                  src={block.metadata.thumbnail}
                  alt="Preview do link"
                  className="w-20 h-20 rounded object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a
                    href={block.metadata?.url || block.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline truncate"
                  >
                    {block.metadata?.url || block.content}
                  </a>
                </div>
                {block.content && block.content !== block.metadata?.url && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {block.content}
                  </p>
                )}
              </div>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={() => onRemove(block.id)}
                  aria-label="Remover link"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {renderContent()}
    </div>
  );
}

