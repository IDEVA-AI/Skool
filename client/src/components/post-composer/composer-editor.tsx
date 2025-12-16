import { TipTapEditor } from '@/components/tiptap-editor';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ComposerEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  useRichText?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function ComposerEditor({
  value,
  onChange,
  placeholder = 'Escreva algo...',
  useRichText = true,
  className,
  autoFocus,
}: ComposerEditorProps) {
  if (useRichText) {
    return (
      <TipTapEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn('border-none shadow-none', className)}
      />
    );
  }

  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'min-h-[120px] resize-none border-none shadow-none px-0 focus-visible:ring-0 text-base placeholder:text-muted-foreground/50',
        className
      )}
      autoFocus={autoFocus}
    />
  );
}

