import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { ConversationList } from '@/components/chat/conversation-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { MessageInput } from '@/components/chat/message-input';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import { useConversation } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { getAvatarUrl } from '@/lib/avatar-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { data: conversation } = useConversation(selectedConversationId);

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

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-zinc-900" />
          <h1 className="text-2xl font-bold text-zinc-900">Mensagens</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // TODO: Implementar criação de nova conversa
            alert('Funcionalidade de criar conversa será implementada em breve');
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Conversa
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar com lista de conversas */}
        <div className="w-80 border-r border-zinc-200 flex flex-col">
          <ConversationList
            selectedConversationId={selectedConversationId || undefined}
            onConversationSelect={(id) => setSelectedConversationId(id)}
          />
        </div>

        {/* Área principal de chat */}
        <div className="flex-1 flex flex-col">
          {selectedConversationId ? (
            <>
              {/* Header da conversa */}
              <div className="flex items-center gap-3 p-4 border-b border-zinc-100 bg-zinc-50">
                <Avatar className="h-10 w-10 border border-zinc-200">
                  <AvatarImage
                    src={getAvatarUrl(displayAvatar, displayName) || undefined}
                  />
                  <AvatarFallback>
                    {displayName[0]?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{displayName}</h2>
                  {conversation?.type === 'group' && conversation.participants && (
                    <p className="text-xs text-muted-foreground">
                      {conversation.participants.length} participantes
                    </p>
                  )}
                </div>
              </div>

              {/* Janela de mensagens */}
              <ChatWindow conversationId={selectedConversationId} />

              {/* Input de mensagem */}
              <MessageInput
                conversationId={selectedConversationId}
                onMessageSent={() => {
                  // Scroll será feito automaticamente pelo ChatWindow
                }}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Selecione uma conversa</p>
                <p className="text-sm">Escolha uma conversa da lista para começar a conversar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

