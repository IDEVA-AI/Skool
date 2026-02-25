import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Emoji from '@tiptap/extension-emoji';
import Mention from '@tiptap/extension-mention';
import { mentionSuggestion } from '@/lib/mention-suggestion';
import { GifPicker } from '@/components/social/gif-picker';
import { ResizableImage } from '@/components/tiptap-extensions/resizable-image';
import { ResizableIframe } from '@/components/tiptap-extensions/resizable-iframe';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef, useCallback } from 'react';
import { TextSelection } from '@tiptap/pm/state';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Smile,
  Loader2
} from 'lucide-react';
import { useStorageUpload } from '@/hooks/use-storage-upload';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TipTapEditor({ 
  value, 
  onChange, 
  placeholder, 
  className 
}: TipTapEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const { user } = useAuth();
  const { uploadFile, uploading } = useStorageUpload();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      ResizableImage.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      ResizableIframe,
      Emoji.configure({
        enableEmoticons: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left',
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Escreva algo...',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention text-primary font-medium',
        },
        suggestion: mentionSuggestion,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-4 py-3 text-foreground',
      },
      handleKeyDown: (view, event) => {
        // Permitir Ctrl+A (ou Cmd+A no Mac) para selecionar tudo
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
          const { state, dispatch } = view;
          const { tr } = state;
          
          // Criar uma seleção de texto que cobre todo o documento
          const { doc } = state;
          const selection = TextSelection.create(doc, 0, doc.content.size);
          
          dispatch(tr.setSelection(selection));
          event.preventDefault();
          return true; // Indica que o evento foi tratado
        }
        return false; // Para outros eventos, permite comportamento padrão
      },
    },
  });

  // Definir handleImageUpload antes de ser usado nos useEffects
  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor || !user) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Apenas imagens (JPG, PNG, GIF, WEBP) são permitidas',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 10MB',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Upload para Supabase Storage usando o bucket course-media
      // O hook já gerencia o bucket, só precisamos passar o path
      const imageUrl = await uploadFile(file, `posts/${user.id}`);
      
      if (imageUrl) {
        // Inserir imagem no editor
        editor.chain().focus().setImage({ src: imageUrl }).run();
        toast({
          title: 'Imagem adicionada',
          description: 'A imagem foi inserida no post',
        });
      } else {
        throw new Error('Falha no upload da imagem');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer upload',
        description: error.message || 'Não foi possível fazer upload da imagem',
        variant: 'destructive',
      });
    }
  }, [editor, user, uploadFile, toast]);

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Resetar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run();
      setEmojiPickerOpen(false);
    }
  };

  // Lista de emojis comuns para o picker simples
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '👐',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '💯', '🔥', '⭐', '🌟', '✨', '💫', '💥', '💢', '💤', '💨',
  ];

  // Função para detectar e converter URLs de vídeo em iframes
  const convertVideoUrlToIframe = useCallback((url: string): { src: string; width?: number; height?: number } | null => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return {
        src: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
        width: 560,
        height: 315,
      };
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        width: 560,
        height: 315,
      };
    }

    return null;
  }, []);

  // Adicionar listener para colar imagens e detectar URLs de vídeo
  useEffect(() => {
    if (!editor || !user) return;

    const handlePaste = async (event: ClipboardEvent) => {
      // Verificar se há imagens no clipboard
      const items = event.clipboardData?.items;
      if (!items) return;

      // Verificar se há texto (URL de vídeo)
      const text = event.clipboardData?.getData('text/plain');
      if (text) {
        const videoData = convertVideoUrlToIframe(text.trim());
        if (videoData) {
          event.preventDefault();
          event.stopPropagation();
          editor.chain().focus().insertContent({
            type: 'iframe',
            attrs: videoData,
          }).run();
          toast({
            title: 'Vídeo inserido',
            description: 'O vídeo foi inserido no post',
          });
          return;
        }
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Verificar se é uma imagem
        if (item.type.indexOf('image') !== -1) {
          event.preventDefault();
          event.stopPropagation();
          
          const file = item.getAsFile();
          if (file) {
            // Fazer upload e inserir a imagem
            await handleImageUpload(file);
          }
          return;
        }
      }
    };

    // Adicionar listener no elemento do editor
    const editorElement = editor.view.dom;
    editorElement.addEventListener('paste', handlePaste);
    
    return () => {
      editorElement.removeEventListener('paste', handlePaste);
    };
  }, [editor, user, handleImageUpload, convertVideoUrlToIframe, toast]);

  // Atualizar conteúdo quando value mudar externamente
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleLinkSubmit = () => {
    if (linkUrl.trim() && editor) {
      // Se não começar com http:// ou https://, adicionar https://
      const url = linkUrl.trim().startsWith('http://') || linkUrl.trim().startsWith('https://')
        ? linkUrl.trim()
        : `https://${linkUrl.trim()}`;
      
      editor.chain().focus().setLink({ href: url }).run();
      setLinkDialogOpen(false);
      setLinkUrl('');
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-background", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
        {/* Títulos */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 text-xs font-bold",
              editor.isActive('heading', { level: 1 }) && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Título 1"
          >
            H1
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 text-xs font-bold",
              editor.isActive('heading', { level: 2 }) && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Título 2"
          >
            H2
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 text-xs font-bold",
              editor.isActive('heading', { level: 3 }) && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Título 3"
          >
            H3
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Formatação de texto */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 font-bold",
              editor.isActive('bold') && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 italic",
              editor.isActive('italic') && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 underline",
              editor.isActive('strike') && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Tachado"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Alinhamento */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive({ textAlign: 'left' }) && "bg-muted"
            )}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Alinhar à esquerda"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive({ textAlign: 'center' }) && "bg-muted"
            )}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Centralizar"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive({ textAlign: 'right' }) && "bg-muted"
            )}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Alinhar à direita"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive({ textAlign: 'justify' }) && "bg-muted"
            )}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            title="Justificar"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Listas */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('bulletList') && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Lista com marcadores"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('orderedList') && "bg-muted"
            )}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Link */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive('link') && "bg-muted"
            )}
            onClick={() => {
              // Se já tem um link selecionado, pegar a URL atual
              const currentUrl = editor.getAttributes('link').href || '';
              setLinkUrl(currentUrl);
              setLinkDialogOpen(true);
            }}
            title="Inserir link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Imagem */}
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleImageButtonClick}
            disabled={uploading || !user}
            title="Inserir imagem"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Emoji */}
        <div className="flex items-center gap-1">
          <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Inserir emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2" align="start">
              <div className="grid grid-cols-10 gap-1 max-h-64 overflow-y-auto">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    className="text-xl p-1 hover:bg-muted rounded transition-colors"
                    onClick={() => handleEmojiSelect(emoji)}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        {/* GIF */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs font-bold"
            onClick={() => setGifPickerOpen(true)}
            title="Inserir GIF"
          >
            GIF
          </Button>
        </div>
      </div>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir Link</DialogTitle>
            <DialogDescription>
              Digite a URL que você deseja adicionar ao texto selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://exemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleLinkSubmit();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setLinkDialogOpen(false);
              setLinkUrl('');
            }}>
              Cancelar
            </Button>
            <Button onClick={handleLinkSubmit} disabled={!linkUrl.trim()}>
              Inserir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GIF Picker */}
      <GifPicker
        isOpen={gifPickerOpen}
        onClose={() => setGifPickerOpen(false)}
        onSelect={(gif) => {
          if (editor) {
            editor.chain().focus().setImage({ src: gif.url, alt: gif.title }).run();
          }
        }}
      />

      {/* Editor */}
      <div className="relative bg-background">
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 120px;
          padding: 1rem;
          color: hsl(var(--foreground));
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: "${placeholder || 'Escreva algo...'}";
          float: left;
          color: hsl(var(--muted-foreground) / 0.5);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror .is-empty::before {
          content: "${placeholder || 'Escreva algo...'}";
          float: left;
          color: hsl(var(--muted-foreground) / 0.5);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror p.is-empty:first-child::before {
          content: "${placeholder || 'Escreva algo...'}";
          float: left;
          color: hsl(var(--muted-foreground) / 0.5);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        .ProseMirror p:first-child {
          margin-top: 0;
        }
        .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0.5rem 0;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.5rem 0;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0.5rem 0;
        }
        .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        .ProseMirror strong {
          font-weight: 700;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          display: block;
        }
        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
        .ProseMirror iframe {
          border-radius: 0.5rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
          display: block;
        }
        .ProseMirror iframe.ProseMirror-selectednode {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
        }
        /* Estilos para handles de redimensionamento */
        .ProseMirror [data-node-view-wrapper] {
          position: relative;
          display: inline-block;
        }
        .ProseMirror [data-node-view-wrapper].ProseMirror-selectednode {
          outline: 3px solid hsl(var(--primary));
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

