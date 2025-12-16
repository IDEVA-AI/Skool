import { useRoute } from 'wouter';
import { useLocation } from 'wouter';
import { ChatWindow } from '@/components/chat/chat-window';
import { MessageInput } from '@/components/chat/message-input';
import { useConversation } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { getAvatarUrl } from '@/lib/avatar-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ChatDetailPage() {
  const [, params] = useRoute('/chat/:id');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const conversationId = params?.id || null;
  const { data: conversation } = useConversation(conversationId);

  // Determinar nome e avatar da conversa
  let displayName = 'Conversa';
  let displayAvatar: string | null = null;

  if (conversation) {
    if (conversation.type === 'dm' && conversation.participants) {
      const otherParticipant = conversation.participants.find(
        (p) => p.user_id !== user?.id
      );
      if (otherParticipant?.user) {
        displayName = otherParticipant.user.name || otherParticipant.user.email?.split('@')[0] || 'Usuário';
        displayAvatar = otherParticipant.user.avatar_url;
      }
    } else {
      displayName = conversation.name || 'Grupo sem nome';
    }
  }

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Conversa não encontrada</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header da conversa */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/chat')}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-10 w-10 border border-border/50">
          <AvatarImage
            src={getAvatarUrl(displayAvatar, displayName) || undefined}
          />
          <AvatarFallback>
            {displayName[0]?.toUpperCase() || 'C'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold">{displayName}</h2>
          {conversation?.type === 'group' && conversation.participants && (
            <p className="text-xs text-muted-foreground">
              {conversation.participants.length} participantes
            </p>
          )}
        </div>
      </div>

      {/* Janela de mensagens */}
      <ChatWindow conversationId={conversationId} />

      {/* Input de mensagem */}
      <MessageInput
        conversationId={conversationId}
        onMessageSent={() => {
          // Scroll será feito automaticamente pelo ChatWindow
        }}
      />
    </div>
  );
}

