import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Loader2 } from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useNotificationsRealtime } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'wouter';

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

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: notifications = [], isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  // Subscrição em tempo real
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
      setLocation('/');
    } else if (notification.reference_type === 'course') {
      setLocation('/courses');
    } else if (notification.reference_type === 'community') {
      setLocation('/');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Notificações</h1>
              <p className="text-muted-foreground mt-2">
                {unreadCount > 0
                  ? `${unreadCount} não ${unreadCount === 1 ? 'lida' : 'lidas'}`
                  : 'Todas as notificações foram lidas'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              variant="outline"
            >
              {markAllReadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Marcar todas como lidas'
              )}
            </Button>
          )}
        </div>
      </header>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma notificação</h3>
            <p className="text-muted-foreground">
              Você será notificado sobre atividades importantes aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-col divide-y divide-border">
              {notifications.map((notif) => {
                const notificationDate = new Date(notif.created_at);
                const timeAgo = formatDistanceToNow(notificationDate, { addSuffix: true, locale: ptBR });

                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "flex items-start gap-4 p-6 hover:bg-muted/50 transition-colors text-left",
                      !notif.is_read && "bg-primary/5"
                    )}
                  >
                    <Avatar className="h-12 w-12 border border-border/50 shrink-0">
                      <AvatarFallback className="text-xl">
                        {getNotificationIcon(notif.type)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h3 className="text-base font-bold truncate">
                          {notif.title}
                        </h3>
                        <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                          {timeAgo}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {notif.content}
                      </p>
                      {notif.reference_type && (
                        <span className="inline-block mt-2 text-xs text-muted-foreground">
                          {notif.reference_type === 'post' && '📝 Post'}
                          {notif.reference_type === 'comment' && '💬 Comentário'}
                          {notif.reference_type === 'course' && '📚 Curso'}
                          {notif.reference_type === 'community' && '👥 Comunidade'}
                        </span>
                      )}
                    </div>
                    {!notif.is_read && (
                      <div className="h-3 w-3 bg-blue-500 rounded-full mt-2 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

