import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TipTapEditor } from '@/components/tiptap-editor';
import { Loader2, Feather } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface PostComposerSimpleProps {
  avatar?: string;
  name: string;
  context?: string;
  contextHighlight?: string;
  onPublish: (title: string, content: string) => Promise<void>;
  isPublishing?: boolean;
  className?: string;
}

export function PostComposerSimple({
  avatar,
  name,
  context,
  contextHighlight,
  onPublish,
  isPublishing = false,
  className,
}: PostComposerSimpleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const hasTextContent = (html: string): boolean => {
    if (!html) return false;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.trim().length > 0;
  };

  const isValid = title.trim().length > 0 && content.trim().length > 0 && hasTextContent(content);
  const isDisabled = isPublishing || !isValid;

  useEffect(() => {
    if (isModalOpen && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isModalOpen]);

  const handlePublish = async () => {
    if (isDisabled) return;
    try {
      await onPublish(title.trim(), content.trim());
      setTitle('');
      setContent('');
      setIsModalOpen(false);
    } catch (error) {
      // parent handles error
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setIsModalOpen(false);
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Trigger */}
      <div
        className={cn(
          'group flex items-center gap-4 py-5 px-5 cursor-text',
          'border border-zinc-200 rounded-2xl',
          'bg-white hover:bg-zinc-50 transition-all duration-300',
          'hover:border-zinc-300 hover:shadow-sm',
          className
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-xs bg-muted text-muted-foreground">{initials}</AvatarFallback>
        </Avatar>
        <span className="flex-1 text-sm text-zinc-400">
          Compartilhe algo com a comunidade...
        </span>
        <Feather className="h-4 w-4 text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors" />
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-zinc-200 bg-white">
          <VisuallyHidden>
            <DialogTitle>Criar novo post</DialogTitle>
          </VisuallyHidden>

          <div className="p-8 space-y-5 overflow-y-auto flex-1">
            {/* Author */}
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={avatar} />
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1.5 text-[13px]">
                <span className="font-semibold text-foreground">{name}</span>
                {context && (
                  <>
                    <span className="text-muted-foreground/40">em</span>
                    <span className={cn(
                      'font-medium',
                      contextHighlight ? 'text-foreground' : 'text-muted-foreground/60'
                    )}>
                      {context}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <Input
              ref={titleInputRef}
              placeholder="Titulo"
              className="font-semibold text-2xl border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-zinc-300 h-auto py-0 tracking-tight"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.select();
                }
              }}
            />

            {/* Divider */}
            <div className="h-px bg-border/20" />

            {/* Editor */}
            <TipTapEditor
              placeholder="Escreva algo..."
              value={content}
              onChange={setContent}
              className="border-none shadow-none min-h-[200px]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-border/20">
            <Button
              variant="ghost"
              className="text-muted-foreground/50 font-medium hover:text-foreground hover:bg-transparent text-sm"
              onClick={handleCancel}
              disabled={isPublishing}
            >
              Cancelar
            </Button>
            <Button
              className="font-medium px-6 text-sm rounded-full"
              onClick={handlePublish}
              disabled={isDisabled}
              title={!isValid ? 'Preencha titulo e conteudo' : undefined}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Publicando...
                </>
              ) : (
                'Publicar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
