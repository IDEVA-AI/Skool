import { Post } from '@/types/social';
import { cn } from '@/lib/utils';

interface PostContentProps {
  post: Post;
  className?: string;
  /** Truncar conteúdo para preview (ex: no card do feed) */
  truncate?: boolean;
  /** Mostrar título */
  showTitle?: boolean;
}

/**
 * PostContent - Renderiza o conteúdo HTML de um post
 * 
 * Otimizado para conteúdo gerado pelo TipTap editor.
 * Suporta: texto formatado, links, imagens, vídeos embeddados, listas.
 */
export function PostContent({ 
  post, 
  className,
  truncate = false,
  showTitle = true,
}: PostContentProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {showTitle && post.title && (
        <h3 className="text-xl font-bold leading-tight text-foreground">
          {post.title}
        </h3>
      )}
      <div
        className={cn(
          // Base styles
          'text-sm leading-relaxed text-foreground/90',
          // Prose styles for rich content
          'prose prose-sm dark:prose-invert max-w-none',
          // Text formatting
          '[&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through',
          // Links
          '[&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80',
          // Lists
          '[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1',
          // Headings
          '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2',
          '[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2',
          '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1',
          // Images
          '[&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto',
          // Iframes (videos)
          '[&_iframe]:rounded-lg [&_iframe]:my-4 [&_iframe]:max-w-full [&_iframe]:aspect-video',
          // Blockquotes
          '[&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
          // Code
          '[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono',
          '[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto',
          // Truncate mode
          truncate && 'line-clamp-3'
        )}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}
