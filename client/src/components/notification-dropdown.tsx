import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, ChevronDown, Loader2 } from "lucide-react";
import { useNotifications, useUnreadNotificationCount, useMarkNotificationRead, useMarkAllNotificationsRead, useNotificationsRealtime } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'comment':
      return '💬';
    case 'reply':
      return '↩️';
    case 'mention':
      return '@';
    case 'post':
      return '📝';
    case 'lesson':
      return '📚';
    case 'announcement':
      return '📢';
    case 'invite':
      return '✉️';
    default:
      return '🔔';
  }
};

export function NotificationDropdown() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: notifications = [], isLoading } = useNotifications(10);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  // Subscrição em tempo real para atualizar contadores automaticamente
  useNotificationsRealtime();

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      toast({
        title: 'Notificações marcadas',
        description: 'Todas as notificações foram marcadas como lidas',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível marcar as notificações',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida ao clicar
    if (!notification.is_read) {
      try {
        await markReadMutation.mutateAsync(notification.id);
      } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
      }
    }

    // Navegar para a referência
    if (notification.reference_type === 'post') {
      // Navegar para o post (será implementado quando tivermos a página de post)
      // Por enquanto, apenas fecha o dropdown
    } else if (notification.reference_type === 'course') {
      setLocation(`/courses`);
    } else if (notification.reference_type === 'community') {
      setLocation(`/`);
    }
  };

  // Usar o contador do hook (que busca do banco) como fonte de verdade
  // O contador pode ser maior que as notificações visíveis (limitadas a 10)
  const displayCount = unreadCount;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          {displayCount > 0 && (
            <span className="absolute -top-0.5 -right-1 h-auto min-w-[16px] px-1 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-background">
              {displayCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="p-4 pb-2 flex items-center justify-between border-b border-border/40 mb-1">
          <h3 className="font-heading font-bold text-lg">Notificações</h3>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <button
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending || unreadCount === 0}
              className="hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markAllReadMutation.isPending ? 'Salvando...' : 'Marcar tudo como lido'}
            </button>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="flex flex-col">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const notificationDate = new Date(notif.created_at);
                const timeAgo = formatDistanceToNow(notificationDate, { addSuffix: true, locale: ptBR });

                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/40 last:border-none",
                      !notif.is_read && "bg-primary/5"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarFallback className="text-lg">
                          {getNotificationIcon(notif.type)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-0.5">
                        <div className="text-sm font-bold truncate">
                          {notif.title}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                          {timeAgo}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-snug line-clamp-2">
                        {notif.content}
                      </p>
                    </div>
                    {!notif.is_read && (
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
            onClick={() => setLocation('/notifications')}
          >
            Ver todas as notificações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
