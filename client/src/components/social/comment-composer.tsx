import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link as LinkIcon, Smile, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GifPicker } from './gif-picker';

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
  replyingTo?: { commentId: string; authorName: string } | null;
  initialContent?: string;
}

export interface CommentComposerHandle {
  focus: () => void;
}

export const CommentComposer = forwardRef<CommentComposerHandle, CommentComposerProps>(({
  currentUserId,
  currentUserName,
  currentUserAvatar,
  parentId,
  placeholder = 'Escreva um comentário...',
  onSubmit,
  onCancel,
  className,
  autoFocus = false,
  replyingTo,
  initialContent,
}, ref) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
  }));

  // Pré-preencher quando replyingTo ou initialContent mudarem
  useEffect(() => {
    if (replyingTo) {
      const mentionText = `@${replyingTo.authorName} `;
      // Se já houver conteúdo, adicionar no início, senão apenas o mention
      setContent(prev => prev.trim() ? `${mentionText}${prev}` : mentionText);
    } else if (initialContent) {
      setContent(initialContent);
    }
  }, [replyingTo, initialContent]);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Usar parentId de replyingTo se disponível, senão usar parentId da prop
      const finalParentId = replyingTo?.commentId || parentId;
      await onSubmit(content.trim(), finalParentId);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+A / Cmd+A para selecionar tudo
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.select();
      return;
    }
    
    // Enter + Ctrl/Cmd para enviar
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
      <Avatar className="h-9 w-9 border border-zinc-200 shrink-0">
        <AvatarImage src={currentUserAvatar} alt={currentUserName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyingTo ? `Respondendo a @${replyingTo.authorName}...` : placeholder}
            className="w-full bg-muted/50 rounded-xl pl-4 pr-24 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none min-h-[52px] max-h-32 text-foreground placeholder:text-muted-foreground border border-zinc-200 shadow-sm"
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            rows={1}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
              title="Inserir link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
              title="Inserir emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted font-medium"
              title="Inserir GIF"
              onClick={() => setGifPickerOpen(true)}
            >
              GIF
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="gap-2 rounded-lg"
            variant="default"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {replyingTo || parentId ? 'Responder' : 'Comentar'}
              </>
            )}
          </Button>
        </div>
      </div>

      <GifPicker
        isOpen={gifPickerOpen}
        onClose={() => setGifPickerOpen(false)}
        onSelect={(gif) => {
          const gifHtml = `<img src="${gif.url}" alt="${gif.title}" />`;
          setContent(prev => prev ? `${prev}\n${gifHtml}` : gifHtml);
        }}
      />
    </div>
  );
});

CommentComposer.displayName = 'CommentComposer';

