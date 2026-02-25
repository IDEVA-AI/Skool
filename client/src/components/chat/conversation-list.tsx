import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConversations } from '@/hooks/use-chat';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAvatarUrl } from '@/lib/avatar-utils';
import { useAuth } from '@/hooks/use-auth';

interface ConversationListProps {
  selectedConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
}

export function ConversationList({ selectedConversationId, onConversationSelect }: ConversationListProps) {
  const { user } = useAuth();
  const { data: conversations = [], isLoading } = useConversations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm text-center">Nenhuma conversa ainda</p>
        <p className="text-xs text-center mt-2">Inicie uma conversa com alguém!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="divide-y divide-border">
        {conversations.map((conversation) => {
          const lastMessageDate = conversation.last_message
            ? new Date(conversation.last_message.created_at)
            : new Date(conversation.updated_at);
          const timeAgo = formatDistanceToNow(lastMessageDate, { addSuffix: true, locale: ptBR });

          // Para DM, mostrar o outro participante
          // Para grupo, mostrar o nome do grupo
          let displayName = conversation.name || 'Conversa sem nome';
          let displayAvatar: string | null = null;

          if (conversation.type === 'dm' && conversation.participants) {
            const otherParticipant = conversation.participants.find(
              (p) => p.user_id !== user?.id
            );
            if (otherParticipant?.user) {
              displayName = otherParticipant.user.name || otherParticipant.user.email?.split('@')[0] || 'Usuário';
              displayAvatar = otherParticipant.user.avatar_url;
            }
          }

          const isSelected = conversation.id === selectedConversationId;

          return (
            <button
              key={conversation.id}
              onClick={() => onConversationSelect(conversation.id)}
              className={cn(
                'w-full flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left',
                isSelected && 'bg-muted'
              )}
            >
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12 border border-zinc-200">
                  <AvatarImage
                    src={getAvatarUrl(displayAvatar, displayName) || undefined}
                  />
                  <AvatarFallback>
                    {displayName[0]?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                {conversation.unread_count && conversation.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                    {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm truncate">{displayName}</span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {timeAgo}
                  </span>
                </div>
                {conversation.last_message && (
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message.sender_id === user?.id ? 'Você: ' : ''}
                    {conversation.last_message.content}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

