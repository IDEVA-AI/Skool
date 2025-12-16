import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { useSendMessage } from '@/hooks/use-chat';

interface MessageInputProps {
  conversationId: string;
  onMessageSent?: () => void;
  placeholder?: string;
}

export function MessageInput({ conversationId, onMessageSent, placeholder = 'Digite uma mensagem...' }: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendMessageMutation = useSendMessage();

  const handleSend = async () => {
    if (!content.trim() || sendMessageMutation.isPending) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        content,
      });
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      onMessageSent?.();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="flex items-end gap-2 p-4 border-t border-border bg-background">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={sendMessageMutation.isPending}
        className="min-h-[44px] max-h-32 resize-none"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={!content.trim() || sendMessageMutation.isPending}
        size="icon"
        className="shrink-0"
      >
        {sendMessageMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

