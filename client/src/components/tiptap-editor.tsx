import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
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
  Link as LinkIcon
} from 'lucide-react';
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
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left',
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Escreva algo...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-4 py-3 text-foreground',
      },
    },
  });

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
      `}</style>
    </div>
  );
}

