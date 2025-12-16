import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMessages, useMarkMessagesAsRead } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAvatarUrl } from '@/lib/avatar-utils';

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useAuth();
  const { data: messages = [], isLoading } = useMessages(conversationId);
  const markAsReadMutation = useMarkMessagesAsRead();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll para o final quando novas mensagens chegarem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Marcar como lida quando a conversa é visualizada
  useEffect(() => {
    if (conversationId && messages.length > 0 && !markAsReadMutation.isPending) {
      // Verificar se há mensagens não lidas antes de marcar como lida
      const hasUnreadMessages = messages.some(
        (msg) => msg.sender_id !== user?.id && !msg.is_deleted
      );
      
      if (hasUnreadMessages) {
        markAsReadMutation.mutate(conversationId);
      }
    }
  }, [conversationId, messages.length, user?.id, markAsReadMutation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isOwn = message.sender_id === user?.id;
          const messageDate = new Date(message.created_at);
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const prevMessageDate = prevMessage ? new Date(prevMessage.created_at) : null;
          const showDateSeparator =
            !prevMessageDate ||
            messageDate.getDate() !== prevMessageDate.getDate() ||
            messageDate.getMonth() !== prevMessageDate.getMonth() ||
            messageDate.getFullYear() !== prevMessageDate.getFullYear();

          const showAvatar =
            !prevMessage ||
            prevMessage.sender_id !== message.sender_id ||
            new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000; // 5 minutos

          return (
            <div key={message.id}>
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {format(messageDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  'flex gap-3',
                  isOwn && 'flex-row-reverse'
                )}
              >
                {showAvatar ? (
                  <Avatar className="h-8 w-8 shrink-0 border border-border/50">
                    <AvatarImage
                      src={getAvatarUrl(
                        message.sender?.avatar_url,
                        message.sender?.name || message.sender?.email
                      ) || undefined}
                    />
                    <AvatarFallback>
                      {(message.sender?.name || message.sender?.email || 'U')[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8 shrink-0" />
                )}
                <div
                  className={cn(
                    'flex flex-col max-w-[70%]',
                    isOwn && 'items-end'
                  )}
                >
                  {showAvatar && (
                    <span className="text-xs text-muted-foreground mb-1 px-1">
                      {message.sender?.name || message.sender?.email?.split('@')[0] || 'Usuário'}
                    </span>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 break-words',
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 px-1">
                    {formatDistanceToNow(messageDate, { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

