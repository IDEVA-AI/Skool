import { MediaBlock } from './media-block';
import { PostBlock } from '@/types/social';
import { cn } from '@/lib/utils';

interface MediaPreviewListProps {
  blocks: PostBlock[];
  onRemove?: (blockId: string) => void;
  className?: string;
}

export function MediaPreviewList({ blocks, onRemove, className }: MediaPreviewListProps) {
  if (blocks.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        <p className="text-sm">Nenhum conteúdo adicionado ainda</p>
        <p className="text-xs mt-1">Use a barra de ferramentas acima para adicionar conteúdo</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {blocks.map((block, index) => (
        <div key={block.id} className="relative">
          <MediaBlock block={block} onRemove={onRemove} />
          {index < blocks.length - 1 && (
            <div className="h-px bg-border my-4" />
          )}
        </div>
      ))}
    </div>
  );
}

