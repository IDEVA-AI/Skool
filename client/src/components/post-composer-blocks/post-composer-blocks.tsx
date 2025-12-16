import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { PostContent, PostBlock } from '@/types/social';
import { ComposerHeader } from '../post-composer/composer-header';
import { MediaToolbar } from './media-toolbar';
import { MediaPreviewList } from './media-preview-list';
import { ContentEditor } from './content-editor';
import { MediaBlock } from './media-block';
import { cn } from '@/lib/utils';

interface PostComposerBlocksProps {
  // User data
  avatar?: string;
  name: string;
  context?: string;
  contextHighlight?: string;

  // Content
  initialBlocks?: PostContent;
  onPublish: (blocks: PostContent) => Promise<void> | void;
  onCancel?: () => void;

  // States
  isPublishing?: boolean;
  disabled?: boolean;

  // Options
  useRichText?: boolean;
  className?: string;
  showActions?: boolean;
}

/**
 * PostComposerBlocks - Block-based post composer
 * 
 * Architecture:
 * - Content stored as ordered array of blocks
 * - Each block has type (text, image, video, link) and content
 * - Blocks can be added, edited, and removed
 * - Supports rich text editing for text blocks
 * - Extensible for future block types
 */
export function PostComposerBlocks({
  avatar,
  name,
  context,
  contextHighlight,
  initialBlocks = [],
  onPublish,
  onCancel,
  isPublishing = false,
  disabled = false,
  useRichText = true,
  className,
  showActions = true,
}: PostComposerBlocksProps) {
  const [blocks, setBlocks] = useState<PostContent>(initialBlocks);

  const hasContent = blocks.length > 0 && blocks.some((block) => {
    if (block.type === 'text') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = block.content;
      const text = tempDiv.textContent || tempDiv.innerText || '';
      return text.trim().length > 0;
    }
    return block.content.trim().length > 0;
  });

  const isValid = hasContent;
  const isDisabled = disabled || isPublishing || !isValid;

  const handleAddBlock = useCallback((type: PostBlock['type'], initialContent?: string, metadata?: PostBlock['metadata']) => {
    const newBlock: PostBlock = {
      id: `block-${Date.now()}-${Math.random()}`,
      type,
      content: initialContent || (type === 'text' ? '' : ''),
      metadata: metadata || (type !== 'text' ? {} : undefined),
    };

    setBlocks((prev) => [...prev, newBlock]);
  }, []);

  const handleRemoveBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== blockId));
  }, []);

  const handleBlockChange = useCallback((blockId: string, content: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, content } : block
      )
    );
  }, []);

  const handlePublish = async () => {
    if (isDisabled) return;
    await onPublish(blocks);
    setBlocks([]);
  };

  const handleCancel = () => {
    setBlocks([]);
    onCancel?.();
  };

  return (
    <Card className={cn('border-border/50 shadow-sm overflow-hidden transition-all duration-300', className)}>
      <CardContent className="pt-6 pb-4 px-6 space-y-4">
        {/* Header */}
        <ComposerHeader
          avatar={avatar}
          name={name}
          context={context}
          contextHighlight={contextHighlight}
        />

        {/* Media Toolbar */}
        <MediaToolbar onAddBlock={handleAddBlock} />

        {/* Content Blocks */}
        <div className="space-y-4 min-h-[200px]">
          {blocks.length === 0 ? (
            <MediaPreviewList blocks={blocks} onRemove={handleRemoveBlock} />
          ) : (
            blocks.map((block, index) => (
              <div key={block.id} className="space-y-2">
                {block.type === 'text' ? (
                  <ContentEditor
                    block={block}
                    onChange={handleBlockChange}
                    useRichText={useRichText}
                    placeholder="Escreva algo..."
                  />
                ) : (
                  <MediaBlock block={block} onRemove={handleRemoveBlock} />
                )}
                {index < blocks.length - 1 && (
                  <div className="h-px bg-border/30 my-2" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Actions Bar */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-border/10">
            <div className="flex items-center gap-4 text-muted-foreground">
              {/* Placeholder for future actions */}
            </div>

            <div className="flex items-center gap-3">
              {onCancel && (
                <Button
                  variant="ghost"
                  className="text-muted-foreground font-semibold hover:bg-transparent hover:text-foreground"
                  onClick={handleCancel}
                  disabled={isPublishing}
                >
                  CANCELAR
                </Button>
              )}
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePublish}
                disabled={isDisabled}
                title={!isValid ? 'Adicione conteúdo para publicar' : undefined}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  'PUBLICAR'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

