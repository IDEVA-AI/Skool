import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposerHeader } from './composer-header';
import { ComposerTitle } from './composer-title';
import { ComposerEditor } from './composer-editor';
import { ComposerActions } from './composer-actions';

export interface PostComposerProps {
  // User data
  avatar?: string;
  name: string;
  context?: string;
  contextHighlight?: string;

  // Title (controlled or uncontrolled)
  titleValue?: string;
  initialTitle?: string;
  onTitleChange?: (title: string) => void;
  titlePlaceholder?: string;
  showTitle?: boolean;

  // Content (controlled or uncontrolled)
  value?: string;
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  useRichText?: boolean;

  // Actions
  onPublish: (data: { title: string; content: string }) => Promise<void> | void;
  onCancel?: () => void;

  // Action handlers (optional)
  onAttach?: () => void;
  onLink?: () => void;
  onVideo?: () => void;
  onPoll?: () => void;
  onEmoji?: () => void;
  onGif?: () => void;

  // States
  isPublishing?: boolean;
  disabled?: boolean;

  // Validation
  minTitleLength?: number;
  minContentLength?: number;
  maxLength?: number;

  // Layout
  className?: string;
  showActions?: boolean;
  autoFocus?: boolean;
}

/**
 * PostComposer - A reusable social media-style post creation component
 * 
 * Architecture decisions:
 * - Split into subcomponents for better maintainability and reusability
 * - State lifting: content managed by parent or internal state
 * - Props-based configuration for maximum flexibility
 * - Support for both rich text and plain text editing
 * - Accessible with proper ARIA labels and keyboard navigation
 * - Loading and disabled states handled gracefully
 */
export function PostComposer({
  avatar,
  name,
  context,
  contextHighlight,
  titleValue,
  initialTitle = '',
  onTitleChange,
  titlePlaceholder = 'Título',
  showTitle = true,
  value,
  initialContent = '',
  onChange,
  placeholder = 'Escreva algo...',
  useRichText = true,
  onPublish,
  onCancel,
  onAttach,
  onLink,
  onVideo,
  onPoll,
  onEmoji,
  onGif,
  isPublishing = false,
  disabled = false,
  minTitleLength = 1,
  minContentLength = 1,
  maxLength,
  className,
  showActions = true,
  autoFocus = false,
}: PostComposerProps) {
  // Title state (controlled or uncontrolled)
  const isTitleControlled = titleValue !== undefined;
  const [internalTitle, setInternalTitle] = useState(initialTitle);
  const title = isTitleControlled ? titleValue : internalTitle;

  // Content state (controlled or uncontrolled)
  const isContentControlled = value !== undefined;
  const [internalContent, setInternalContent] = useState(initialContent);
  const content = isContentControlled ? value : internalContent;

  // Update internal states when initial values change (uncontrolled mode)
  useEffect(() => {
    if (!isTitleControlled && initialTitle !== internalTitle) {
      setInternalTitle(initialTitle);
    }
  }, [initialTitle, isTitleControlled]);

  useEffect(() => {
    if (!isContentControlled && initialContent !== internalContent) {
      setInternalContent(initialContent);
    }
  }, [initialContent, isContentControlled]);

  const handleTitleChange = (newTitle: string) => {
    if (isTitleControlled) {
      onTitleChange?.(newTitle);
    } else {
      setInternalTitle(newTitle);
      onTitleChange?.(newTitle);
    }
  };

  const handleContentChange = (newContent: string) => {
    if (isContentControlled) {
      onChange?.(newContent);
    } else {
      setInternalContent(newContent);
      onChange?.(newContent);
    }
  };

  // Helper to check if content has actual text (not just HTML tags)
  const hasTextContent = (html: string): boolean => {
    if (!html.trim()) return false;
    if (!useRichText) return html.trim().length >= minContentLength;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.trim().length >= minContentLength;
  };

  const isTitleValid = title.trim().length >= minTitleLength;
  const isContentValid = hasTextContent(content);
  const isValid = isTitleValid && isContentValid;
  const isDisabled = disabled || isPublishing || !isValid;

  const handlePublish = async () => {
    if (isDisabled) return;
    await onPublish({ title: title.trim(), content });
    if (!isTitleControlled) {
      setInternalTitle(''); // Reset after publish (uncontrolled mode)
    }
    if (!isContentControlled) {
      setInternalContent(''); // Reset after publish (uncontrolled mode)
    }
  };

  const handleCancel = () => {
    if (!isTitleControlled) {
      setInternalTitle('');
    }
    if (!isContentControlled) {
      setInternalContent('');
    }
    onCancel?.();
  };

  return (
    <Card className={cn('border-zinc-200 shadow-sm overflow-hidden transition-all duration-300', className)}>
      <CardContent className="pt-6 pb-4 px-6 space-y-4">
        {/* Header */}
        <ComposerHeader
          avatar={avatar}
          name={name}
          context={context}
          contextHighlight={contextHighlight}
        />

        {/* Title and Editor */}
        <div className="space-y-2">
          {showTitle && (
            <ComposerTitle
              value={title}
              onChange={handleTitleChange}
              placeholder={titlePlaceholder}
              autoFocus={autoFocus}
            />
          )}
          <ComposerEditor
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            useRichText={useRichText}
            className="border-none shadow-none"
            autoFocus={autoFocus && !showTitle}
          />
        </div>

        {/* Actions Bar */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-border/10">
            <ComposerActions
              onAttach={onAttach}
              onLink={onLink}
              onVideo={onVideo}
              onPoll={onPoll}
              onEmoji={onEmoji}
              onGif={onGif}
            />

            {/* Footer Actions */}
            <div className="flex items-center gap-3">
              {onCancel && (
                <Button
                  variant="ghost"
                  className="text-muted-foreground font-semibold hover:bg-transparent hover:text-foreground"
                  onClick={handleCancel}
                  disabled={isPublishing}
                >
                  CANCELAR
                </Button>
              )}
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePublish}
                disabled={isDisabled}
                title={
                  !isValid
                    ? !isTitleValid
                      ? `Título deve ter pelo menos ${minTitleLength} caractere${minTitleLength > 1 ? 's' : ''}`
                      : `Conteúdo deve ter pelo menos ${minContentLength} caractere${minContentLength > 1 ? 's' : ''}`
                    : undefined
                }
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  'PUBLICAR'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

