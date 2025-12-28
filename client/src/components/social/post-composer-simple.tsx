import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TipTapEditor } from '@/components/tiptap-editor';
import { Loader2 } from 'lucide-react';
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

/**
 * PostComposerSimple - Composer simples que abre modal ao clicar
 * 
 * Comportamento:
 * - Mostra apenas input "Escreva algo..." como trigger
 * - Ao clicar, abre um modal com título e editor de conteúdo
 * - O campo de título recebe foco automaticamente quando o modal abre
 * - Modal pode ser fechado clicando fora ou no botão Cancelar
 */
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

  // Verificar se há conteúdo válido
  const hasTextContent = (html: string): boolean => {
    if (!html) return false;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.trim().length > 0;
  };

  const isValid = title.trim().length > 0 && content.trim().length > 0 && hasTextContent(content);
  const isDisabled = isPublishing || !isValid;

  // Focar no campo de título quando o modal abrir
  useEffect(() => {
    if (isModalOpen && titleInputRef.current) {
      // Pequeno delay para garantir que o modal está totalmente renderizado
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isModalOpen]);

  const handlePublish = async () => {
    if (isDisabled) return;

    try {
      await onPublish(title.trim(), content.trim());
      // Limpar e fechar modal após publicação
      setTitle('');
      setContent('');
      setIsModalOpen(false);
    } catch (error) {
      // Erro será tratado pelo componente pai
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      {/* Trigger Card */}
      <Card className={cn('border-border/50 shadow-sm overflow-hidden transition-all duration-300', className)}>
        <CardContent 
          className="p-4 flex items-center gap-4 cursor-text" 
          onClick={handleOpenModal}
        >
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Escreva algo..."
              className="w-full bg-transparent border-none outline-none text-muted-foreground cursor-text"
              readOnly
            />
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <VisuallyHidden>
            <DialogTitle>Criar novo post</DialogTitle>
          </VisuallyHidden>

          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={avatar} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 text-sm">
                <span className="font-semibold text-foreground">{name}</span>
                {context && (
                  <>
                    <span className="text-muted-foreground">publicando em</span>
                    <span className={cn(
                      "font-medium",
                      contextHighlight ? "text-primary" : "text-muted-foreground"
                    )}>
                      {context}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Título */}
            <Input
              ref={titleInputRef}
              placeholder="Assunto"
              className="text-6xl font-bold border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 h-auto py-0"
              style={{ fontSize: '1.4rem', lineHeight: '1' }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                // Ctrl+A / Cmd+A para selecionar todo o texto
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.select();
                }
              }}
            />

            {/* Editor de Conteúdo */}
            <TipTapEditor
              placeholder="Escreva algo..."
              value={content}
              onChange={setContent}
              className="border-none shadow-none min-h-[200px]"
            />
          </div>

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-4 px-6 pb-6 border-t border-border/10 bg-background">
            <div className="flex items-center gap-4 text-muted-foreground">
              {/* Placeholder para futuras ações */}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-muted-foreground font-medium hover:bg-muted/50 hover:text-foreground"
                onClick={handleCancel}
                disabled={isPublishing}
              >
                Cancelar
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                onClick={handlePublish}
                disabled={isDisabled}
                title={!isValid ? 'Preencha título e conteúdo' : undefined}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  'Publicar'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

