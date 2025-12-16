import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ComposerTitleProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function ComposerTitle({
  value,
  onChange,
  placeholder = 'Título',
  className,
  autoFocus,
}: ComposerTitleProps) {
  return (
    <Input
      placeholder={placeholder}
      className={cn(
        'text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 h-auto py-0',
        className
      )}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus={autoFocus}
    />
  );
}

