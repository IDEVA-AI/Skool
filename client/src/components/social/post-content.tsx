import { Post, PostBlock } from '@/types/social';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostContentProps {
  post: Post;
  className?: string;
}

/**
 * BlockRenderer - Renderiza um único bloco de conteúdo
 */
function BlockRenderer({ block }: { block: PostBlock }) {
  switch (block.type) {
    case 'text':
      return (
        <div
          className="text-sm leading-relaxed text-foreground/90 prose prose-sm dark:prose-invert max-w-none [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case 'image':
      const imageUrl = block.metadata?.url || block.content;
      return (
        <div className="relative w-full rounded-lg overflow-hidden border border-border/50">
          <AspectRatio ratio={16 / 9}>
            <img
              src={imageUrl}
              alt={block.metadata?.alt || 'Imagem'}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        </div>
      );

    case 'video':
      const videoUrl = block.metadata?.url || block.content;
      // Detectar se é YouTube, Vimeo, etc.
      const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
      const isVimeo = videoUrl.includes('vimeo.com');

      if (isYouTube) {
        // Extrair ID do YouTube
        const youtubeId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        if (youtubeId) {
          return (
            <div className="relative w-full rounded-lg overflow-hidden border border-border/50">
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </AspectRatio>
            </div>
          );
        }
      }

      if (isVimeo) {
        const vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
        if (vimeoId) {
          return (
            <div className="relative w-full rounded-lg overflow-hidden border border-border/50">
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoId}`}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </AspectRatio>
            </div>
          );
        }
      }

      // Fallback para vídeo genérico
      return (
        <div className="relative w-full rounded-lg overflow-hidden border border-border/50 bg-muted">
          <AspectRatio ratio={16 / 9}>
            <div className="flex items-center justify-center h-full">
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-8 w-8" />
                <span className="text-sm">Assistir vídeo</span>
              </a>
            </div>
          </AspectRatio>
        </div>
      );

    case 'link':
      const linkUrl = block.metadata?.url || block.content;
      const linkTitle = block.content && block.content !== linkUrl ? block.content : 'Link';
      
      return (
        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors group">
          <div className="flex items-start gap-3">
            {block.metadata?.thumbnail && (
              <div className="w-20 h-20 rounded overflow-hidden shrink-0 border border-border/50">
                <img
                  src={block.metadata.thumbnail}
                  alt="Preview do link"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <a
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline truncate"
                >
                  {linkTitle}
                </a>
              </div>
              {block.metadata?.url && (
                <p className="text-xs text-muted-foreground truncate">
                  {linkUrl}
                </p>
              )}
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      );

    default:
      return null;
  }
}

/**
 * PostContent - Renderiza o conteúdo de um post
 * Suporta tanto blocks (novo formato) quanto content (formato antigo)
 */
export function PostContent({ post, className }: PostContentProps) {
  // Se tem blocks, renderiza os blocos
  if (post.blocks && post.blocks.length > 0) {
    return (
      <div className={cn('space-y-4', className)}>
        {post.title && (
          <h3 className="text-xl font-bold leading-tight">{post.title}</h3>
        )}
        <div className="space-y-4">
          {post.blocks.map((block, index) => (
            <div key={block.id || index}>
              <BlockRenderer block={block} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback para posts antigos com content string
  return (
    <div className={cn('space-y-3', className)}>
      {post.title && (
        <h3 className="text-xl font-bold leading-tight">{post.title}</h3>
      )}
      <div
        className="text-sm leading-relaxed text-foreground/90 prose prose-sm dark:prose-invert max-w-none [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}

