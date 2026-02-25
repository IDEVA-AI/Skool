import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TipTapEditor } from '@/components/tiptap-editor';
import { Loader2, Feather, BarChart3, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export interface PollData {
  question: string;
  options: string[];
}

interface PostComposerSimpleProps {
  avatar?: string;
  name: string;
  context?: string;
  contextHighlight?: string;
  onPublish: (title: string, content: string, poll?: PollData) => Promise<void>;
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
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
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
      const pollData = showPoll && pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2
        ? { question: pollQuestion.trim(), options: pollOptions.filter(o => o.trim()) }
        : undefined;
      await onPublish(title.trim(), content.trim(), pollData);
      setTitle('');
      setContent('');
      setShowPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      setIsModalOpen(false);
    } catch (error) {
      // parent handles error
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setShowPoll(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setIsModalOpen(false);
  };

  const addPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
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

            {/* Poll Form */}
            {showPoll && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Enquete
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPoll(false)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  placeholder="Pergunta da enquete"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="text-sm"
                />
                <div className="space-y-2">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Opção ${index + 1}`}
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                        className="text-sm"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(index)}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pollOptions.length < 5 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addPollOption}
                    className="text-xs text-muted-foreground hover:text-foreground gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar opção
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 px-8 py-5 border-t border-border/20">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPoll(!showPoll)}
                className={cn(
                  'gap-1.5 text-xs font-medium',
                  showPoll
                    ? 'text-primary hover:text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <BarChart3 className="h-4 w-4" />
                Enquete
              </Button>
              <Button
                variant="ghost"
                className="text-muted-foreground/50 font-medium hover:text-foreground hover:bg-transparent text-sm"
                onClick={handleCancel}
                disabled={isPublishing}
              >
                Cancelar
              </Button>
            </div>
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
