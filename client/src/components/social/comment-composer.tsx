import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentComposerProps {
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  parentId?: string;
  placeholder?: string;
  onSubmit: (content: string, parentId?: string) => void;
  onCancel?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export function CommentComposer({
  currentUserId,
  currentUserName,
  currentUserAvatar,
  parentId,
  placeholder = 'Escreva um comentário...',
  onSubmit,
  onCancel,
  className,
  autoFocus = false,
}: CommentComposerProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), parentId);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const initials = currentUserName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('flex gap-3', className)}>
      <Avatar className="h-8 w-8 border border-border/50 shrink-0">
        <AvatarImage src={currentUserAvatar} alt={currentUserName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="min-h-[60px] resize-none text-sm"
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
        />
        <div className="flex items-center justify-end gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {parentId ? 'Responder' : 'Comentar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

