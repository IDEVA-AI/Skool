import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Emoji from '@tiptap/extension-emoji';
import Mention from '@tiptap/extension-mention';
import { mentionSuggestion } from '@/lib/mention-suggestion';
import { TextSelection } from '@tiptap/pm/state';
import { ResizableImage } from '@/components/tiptap-extensions/resizable-image';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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

const commonEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '👐',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '💯', '🔥', '⭐', '🌟', '✨', '💫', '💥', '💢', '💤', '💨',
];

export const CommentComposer = forwardRef<CommentComposerHandle, CommentComposerProps>(({
  currentUserId,
  currentUserName,
  currentUserAvatar,
  parentId,
  placeholder: placeholderText = 'Escreva um comentário...',
  onSubmit,
  onCancel,
  className,
  autoFocus = false,
  replyingTo,
  initialContent,
}, ref) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const effectivePlaceholder = replyingTo
    ? `Respondendo a @${replyingTo.authorName}...`
    : placeholderText;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder: effectivePlaceholder,
      }),
      Emoji.configure({
        enableEmoticons: true,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention text-primary font-medium',
        },
        suggestion: mentionSuggestion,
      }),
      ResizableImage.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-2',
        },
      }),
    ],
    content: initialContent || '',
    autofocus: autoFocus,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[40px] max-h-32 overflow-y-auto px-4 py-3 text-sm text-foreground',
      },
      handleKeyDown: (view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          handleSubmitFromEditor();
          return true;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
          const { state, dispatch } = view;
          const { tr, doc } = state;
          dispatch(tr.setSelection(TextSelection.create(doc, 0, doc.content.size)));
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
  }, [effectivePlaceholder]);

  // Insert @mention when replyingTo changes
  const lastReplyIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (editor && replyingTo && lastReplyIdRef.current !== replyingTo.commentId) {
      lastReplyIdRef.current = replyingTo.commentId;
      // Small delay to ensure editor is ready
      setTimeout(() => {
        editor.chain().focus().clearContent().insertContent([
          {
            type: 'mention',
            attrs: { id: replyingTo.authorName, label: replyingTo.authorName },
          },
          { type: 'text', text: ' ' },
        ]).run();
      }, 50);
    }
  }, [editor, replyingTo]);

  useImperativeHandle(ref, () => ({
    focus: () => {
      editor?.commands.focus();
    },
  }));

  const handleSubmitFromEditor = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    const isEmpty = !html || html === '<p></p>' || !editor.state.doc.textContent.trim();
    if (isEmpty || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const finalParentId = replyingTo?.commentId || parentId;
      onSubmit(html, finalParentId);
      editor.commands.clearContent();
    } finally {
      setIsSubmitting(false);
    }
  }, [editor, isSubmitting, replyingTo, parentId, onSubmit]);

  const handleLinkSubmit = () => {
    if (linkUrl.trim() && editor) {
      const url = linkUrl.trim().startsWith('http://') || linkUrl.trim().startsWith('https://')
        ? linkUrl.trim()
        : `https://${linkUrl.trim()}`;
      editor.chain().focus().setLink({ href: url }).run();
      setLinkDialogOpen(false);
      setLinkUrl('');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run();
      setEmojiPickerOpen(false);
    }
  };

  const editorIsEmpty = !editor || !editor.state.doc.textContent.trim();

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
          <div className="w-full bg-muted/50 rounded-xl pr-24 text-sm focus-within:ring-1 focus-within:ring-primary/20 min-h-[52px] max-h-32 overflow-hidden text-foreground border border-zinc-200 shadow-sm">
            <EditorContent editor={editor} />
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
              title="Inserir link"
              onClick={() => {
                const currentUrl = editor?.getAttributes('link').href || '';
                setLinkUrl(currentUrl);
                setLinkDialogOpen(true);
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                  title="Inserir emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2" align="end">
                <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
                  {commonEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      className="text-xl p-1 hover:bg-muted rounded transition-colors"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
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
            onClick={handleSubmitFromEditor}
            disabled={editorIsEmpty || isSubmitting}
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

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir Link</DialogTitle>
            <DialogDescription>
              Digite a URL que deseja adicionar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment-link-url">URL</Label>
              <Input
                id="comment-link-url"
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
            <Button variant="outline" onClick={() => { setLinkDialogOpen(false); setLinkUrl(''); }}>
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

      <style>{`
        .comment-composer-editor .ProseMirror {
          outline: none;
          min-height: 40px;
          max-height: 8rem;
          overflow-y: auto;
        }
        .comment-composer-editor .ProseMirror p {
          margin: 0.25rem 0;
        }
        .comment-composer-editor .ProseMirror p:first-child {
          margin-top: 0;
        }
        .comment-composer-editor .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        .comment-composer-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: hsl(var(--muted-foreground) / 0.5);
          float: left;
          pointer-events: none;
          height: 0;
        }
        .comment-composer-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 0.5rem 0;
          display: block;
        }
        .comment-composer-editor .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        .comment-composer-editor .ProseMirror .mention {
          color: hsl(var(--primary));
          font-weight: 500;
        }
      `}</style>
    </div>
  );
});

CommentComposer.displayName = 'CommentComposer';
