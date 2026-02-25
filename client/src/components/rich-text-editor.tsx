import { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, List, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const isCommandActive = (command: string): boolean => {
    return document.queryCommandState(command);
  };

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive('bold') && "bg-muted"
            )}
            onClick={() => execCommand('bold')}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive('italic') && "bg-muted"
            )}
            onClick={() => execCommand('italic')}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive('underline') && "bg-muted"
            )}
            onClick={() => execCommand('underline')}
            title="Sublinhado (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive('justifyLeft') && "bg-muted"
            )}
            onClick={() => execCommand('justifyLeft')}
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
              isCommandActive('justifyCenter') && "bg-muted"
            )}
            onClick={() => execCommand('justifyCenter')}
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
              isCommandActive('justifyRight') && "bg-muted"
            )}
            onClick={() => execCommand('justifyRight')}
            title="Alinhar à direita"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isCommandActive('insertUnorderedList') && "bg-muted"
            )}
            onClick={() => execCommand('insertUnorderedList')}
            title="Lista com marcadores"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              const url = prompt('Digite a URL:');
              if (url) {
                execCommand('createLink', url);
              }
            }}
            title="Inserir link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "min-h-[120px] px-4 py-3 text-base focus:outline-none",
            "prose prose-sm max-w-none",
            "text-foreground",
            "[&_strong]:font-bold [&_em]:italic [&_u]:underline",
            "[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6",
            "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
            "[&_a]:text-primary [&_a]:underline",
            isFocused && "ring-1 ring-ring"
          )}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
        {!value && !isFocused && placeholder && (
          <div className="absolute top-3 left-4 pointer-events-none text-muted-foreground/50 text-base">
            {placeholder}
          </div>
        )}
      </div>
      
      <style>{`
        [contenteditable] {
          outline: none;
        }
        [contenteditable]:focus {
          outline: none;
        }
        [contenteditable] * {
          margin: 0;
        }
        [contenteditable] p {
          margin: 0.5rem 0;
        }
        [contenteditable] p:first-child {
          margin-top: 0;
        }
        [contenteditable] p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}

