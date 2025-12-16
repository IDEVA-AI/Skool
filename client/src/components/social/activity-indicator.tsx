import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Post } from '@/types/social';
import { cn } from '@/lib/utils';

interface ActivityIndicatorProps {
  post: Post;
  className?: string;
}

export function ActivityIndicator({ post, className }: ActivityIndicatorProps) {
  const hasReactions = post.reactions && post.reactions.length > 0;
  const hasComments = post.commentCount > 0;
  const hasActivity = hasReactions || hasComments || post.lastActivityAt;

  if (!hasActivity) {
    return null;
  }

  // Coletar avatares únicos de quem interagiu
  const avatars: string[] = [];
  
  // Adicionar avatares de reações
  if (post.reactions) {
    post.reactions.forEach((reaction) => {
      // Em uma implementação real, você buscaria o avatar do usuário
      // Por enquanto, vamos usar os recentAvatars se disponíveis
    });
  }

  // Usar recentAvatars se disponível, senão usar avatares dos comentários
  const displayAvatars = post.recentAvatars || [];
  
  // Se não há avatares mas há comentários, usar avatar do autor do último comentário
  if (displayAvatars.length === 0 && post.comments && post.comments.length > 0) {
    const lastComment = post.comments[post.comments.length - 1];
    if (lastComment.authorAvatar) {
      displayAvatars.push(lastComment.authorAvatar);
    }
  }

  // Calcular totais
  const totalReactions = post.reactions?.length || 0;
  const totalComments = post.commentCount || 0;

  // Determinar texto de atividade
  let activityText = '';
  if (post.lastActivityAt && post.lastActivityType) {
    const timeAgo = formatDistanceToNow(post.lastActivityAt, { addSuffix: true, locale: ptBR });
    if (post.lastActivityType === 'comment') {
      activityText = `Novo comentário ${timeAgo}`;
    } else if (post.lastActivityType === 'reaction') {
      activityText = `Nova reação ${timeAgo}`;
    }
  } else if (post.comments && post.comments.length > 0) {
    const lastComment = post.comments[post.comments.length - 1];
    const timeAgo = formatDistanceToNow(lastComment.createdAt, { addSuffix: true, locale: ptBR });
    activityText = `Novo comentário ${timeAgo}`;
  }

  return (
    <div className={cn('flex items-center gap-3 text-xs text-muted-foreground', className)}>
      {/* Avatares empilhados */}
      {displayAvatars.length > 0 && (
        <div className="flex items-center -space-x-2">
          {displayAvatars.slice(0, 3).map((avatar, index) => (
            <Avatar
              key={index}
              className="h-6 w-6 border-2 border-background"
            >
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-[10px]">U</AvatarFallback>
            </Avatar>
          ))}
          {displayAvatars.length > 3 && (
            <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium">
              +{displayAvatars.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Contadores e texto de atividade */}
      <div className="flex items-center gap-3 flex-wrap">
        {totalReactions > 0 && (
          <span className="font-medium">
            {totalReactions} {totalReactions === 1 ? 'curtida' : 'curtidas'}
          </span>
        )}
        
        {totalComments > 0 && (
          <span className="font-medium">
            {totalComments} {totalComments === 1 ? 'comentário' : 'comentários'}
          </span>
        )}

        {activityText && (
          <span className="text-muted-foreground/80">
            {activityText}
          </span>
        )}
      </div>
    </div>
  );
}

