import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Search, Loader2 } from "lucide-react";
import { useConversations, useUnreadMessagesCount } from "@/hooks/use-chat";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { getAvatarUrl } from "@/lib/avatar-utils";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function ChatDropdown() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: conversations = [], isLoading } = useConversations();
  const unreadCount = useUnreadMessagesCount();
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar conversas por pesquisa
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    if (conv.name?.toLowerCase().includes(query)) return true;
    
    if (conv.type === 'dm' && conv.participants) {
      const otherParticipant = conv.participants.find((p) => p.user_id !== user?.id);
      if (otherParticipant?.user) {
        const name = otherParticipant.user.name?.toLowerCase() || '';
        const email = otherParticipant.user.email?.toLowerCase() || '';
        if (name.includes(query) || email.includes(query)) return true;
      }
    }
    
    if (conv.last_message?.content.toLowerCase().includes(query)) return true;
    
    return false;
  });

  const handleConversationClick = (conversationId: string) => {
    setLocation(`/chat/${conversationId}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <MessageSquare className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-auto min-w-[16px] px-1 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-background">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg">Conversas</h3>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar conversas" 
              className="pl-9 bg-muted/50 border-none h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">
                  {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const lastMessageDate = conv.last_message
                  ? new Date(conv.last_message.created_at)
                  : new Date(conv.updated_at);
                const timeAgo = formatDistanceToNow(lastMessageDate, { addSuffix: true, locale: ptBR });

                // Para DM, mostrar o outro participante
                let displayName = conv.name || 'Conversa sem nome';
                let displayAvatar: string | null = null;

                if (conv.type === 'dm' && conv.participants) {
                  const otherParticipant = conv.participants.find(
                    (p) => p.user_id !== user?.id
                  );
                  if (otherParticipant?.user) {
                    displayName = otherParticipant.user.name || otherParticipant.user.email?.split('@')[0] || 'Usuário';
                    displayAvatar = otherParticipant.user.avatar_url;
                  }
                }

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleConversationClick(conv.id)}
                    className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/40 last:border-none"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 border border-border/50 shrink-0">
                        <AvatarImage
                          src={getAvatarUrl(displayAvatar, displayName) || undefined}
                        />
                        <AvatarFallback>
                          {displayName[0]?.toUpperCase() || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      {conv.unread_count && conv.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 h-auto min-w-[20px] px-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                          {conv.unread_count}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-sm truncate">
                          {displayName}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {timeAgo}
                        </span>
                      </div>
                      {conv.last_message && (
                        <p className="text-sm text-muted-foreground truncate leading-snug">
                          {conv.last_message.sender_id === user?.id ? 'Você: ' : ''}
                          {conv.last_message.content}
                        </p>
                      )}
                    </div>
                    {conv.unread_count && conv.unread_count > 0 && (
                      <div className="h-2.5 w-2.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-2 border-t border-border/40 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground h-8"
            onClick={() => setLocation('/chat')}
          >
            Ver todas as mensagens
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
