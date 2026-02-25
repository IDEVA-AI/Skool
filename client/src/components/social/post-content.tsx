import { useMemo } from 'react';
import { Post } from '@/types/social';
import { cn } from '@/lib/utils';
import { PollWidget } from './poll-widget';
import { LinkPreviewCard } from './link-preview-card';

interface PostContentProps {
  post: Post;
  className?: string;
  truncate?: boolean;
  showTitle?: boolean;
}

/**
 * Transform #hashtag text into clickable links in HTML content
 */
function linkifyHashtags(html: string): string {
  // Match #hashtag patterns (supports accented characters for pt-BR)
  return html.replace(
    /#([a-zA-Z0-9_\u00C0-\u024F]+)/g,
    '<a href="/hashtag/$1" class="hashtag-link text-primary hover:underline" data-hashtag="$1">#$1</a>'
  );
}

export function PostContent({
  post,
  className,
  truncate = false,
  showTitle = true,
}: PostContentProps) {
  const processedContent = linkifyHashtags(post.content);

  // Extract first URL from content for link preview (skip YouTube/Vimeo embeds)
  const firstUrl = useMemo(() => {
    const urlMatch = post.content.match(/https?:\/\/[^\s<"']+/);
    if (!urlMatch) return null;
    const url = urlMatch[0];
    // Skip video embed URLs (they're already rendered as iframes)
    if (/youtube\.com|youtu\.be|vimeo\.com/.test(url)) return null;
    return url;
  }, [post.content]);

  return (
    <div className={cn('space-y-2.5', className)}>
      {showTitle && post.title && (
        <h3 className="font-semibold text-[1.35rem] leading-[1.25] text-zinc-900 tracking-tight">
          {post.title}
        </h3>
      )}
      <div
        className={cn(
          'text-[13.5px] leading-[1.7] text-zinc-600',
          'prose prose-sm max-w-none',
          '[&_strong]:font-semibold [&_strong]:text-foreground/90',
          '[&_em]:italic',
          '[&_u]:underline [&_s]:line-through',
          '[&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-foreground/20 [&_a:hover]:decoration-foreground/50',
          '[&_a.hashtag-link]:no-underline [&_a.hashtag-link]:font-medium',
          '[&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:my-0.5',
          '[&_h1]:text-xl [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2',
          '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2',
          '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1',
          '[&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto',
          '[&_iframe]:rounded-lg [&_iframe]:my-4 [&_iframe]:max-w-full [&_iframe]:aspect-video',
          '[&_blockquote]:border-l-2 [&_blockquote]:border-foreground/10 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-foreground/50',
          '[&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono',
          '[&_pre]:bg-muted/30 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto',
          truncate && 'line-clamp-3'
        )}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      {/* Link preview for first URL found in content */}
      {firstUrl && !truncate && <LinkPreviewCard url={firstUrl} />}

      {/* Poll widget (lazy-loaded per post) */}
      <PollWidget postId={parseInt(post.id) || 0} />
    </div>
  );
}
