import { useState, useEffect } from 'react';
import { TipTapEditor } from '@/components/tiptap-editor';
import { Textarea } from '@/components/ui/textarea';
import { PostBlock } from '@/types/social';
import { cn } from '@/lib/utils';

interface ContentEditorProps {
  block: PostBlock;
  onChange: (blockId: string, content: string) => void;
  placeholder?: string;
  useRichText?: boolean;
  className?: string;
}

export function ContentEditor({
  block,
  onChange,
  placeholder = 'Escreva algo...',
  useRichText = true,
  className,
}: ContentEditorProps) {
  const [content, setContent] = useState(block.content);

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    onChange(block.id, newContent);
  };

  if (useRichText && block.type === 'text') {
    return (
      <TipTapEditor
        value={content}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn('border-none shadow-none', className)}
      />
    );
  }

  return (
    <Textarea
      value={content}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'min-h-[120px] resize-none border-none shadow-none px-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/50',
        className
      )}
    />
  );
}

