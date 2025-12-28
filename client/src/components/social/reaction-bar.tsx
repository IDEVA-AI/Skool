import { useState, useRef, useEffect } from 'react';
import { ThumbsUp, Heart, Laugh } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ReactionType } from '@/types/social';
import { cn } from '@/lib/utils';

interface ReactionBarProps {
  reactions: Array<{ id: string; type: ReactionType; userId: string; userName: string }>;
  userReaction?: ReactionType | null;
  onReact: (type: ReactionType) => void;
  compact?: boolean;
  className?: string;
}

const reactionConfig: Record<ReactionType, { 
  icon: typeof ThumbsUp; 
  label: string; 
  color: string;
  bgColor: string;
}> = {
  like: {
    icon: ThumbsUp,
    label: 'Curtir',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
  },
  love: {
    icon: Heart,
    label: 'Amar',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 hover:bg-red-500/20',
  },
  laugh: {
    icon: Laugh,
    label: 'Rir',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
  },
};

export function ReactionBar({
  reactions,
  userReaction,
  onReact,
  compact = false,
  className,
}: ReactionBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Contar reações por tipo
  const reactionCounts = reactions.reduce(
    (acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    },
    { like: 0, love: 0, laugh: 0 } as Record<ReactionType, number>
  );

  const totalReactions = reactions.length;
  
  // Encontrar a reação mais popular (para mostrar ícone principal)
  const topReaction = (Object.entries(reactionCounts) as [ReactionType, number][])
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'like';

  const handleReact = (type: ReactionType) => {
    onReact(type);
    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(true);
      setIsOpen(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const activeConfig = userReaction ? reactionConfig[userReaction] : null;
  const ActiveIcon = activeConfig?.icon || ThumbsUp;
  const TopReactionIcon = reactionConfig[topReaction].icon;

  // Versão compacta para comentários
  if (compact) {
    return (
      <div className={cn('flex items-center', className)}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'h-7 px-2 gap-1 rounded-full transition-all duration-200',
                userReaction
                  ? `${activeConfig?.color} ${activeConfig?.bgColor}`
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
              )}
            >
              <ActiveIcon
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  userReaction && 'fill-current scale-110'
                )}
              />
              {totalReactions > 0 && (
                <span className="text-xs font-medium tabular-nums">{totalReactions}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-1 flex gap-1"
            side="top"
            align="start"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
          {(['like', 'love', 'laugh'] as ReactionType[]).map((type) => {
            const config = reactionConfig[type];
            const Icon = config.icon;
            const isActive = userReaction === type;
            return (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleReact(type)}
                className={cn(
                  'h-9 w-9 p-0 rounded-full transition-all duration-200 hover:scale-125',
                  isActive && `${config.bgColor} ${config.color}`
                )}
                title={config.label}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isActive && 'fill-current'
                  )}
                />
              </Button>
            );
          })}
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Versão normal para posts
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
              'h-8 px-3 gap-2 rounded-full transition-all duration-200',
              userReaction
                ? `${activeConfig?.color} ${activeConfig?.bgColor}`
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            )}
          >
            {/* Mostrar ícone da reação mais popular ou ícone padrão */}
            {totalReactions > 0 ? (
              <TopReactionIcon
                className={cn(
                  'h-4 w-4 transition-transform',
                  userReaction === topReaction && 'fill-current'
                )}
              />
            ) : (
              <ActiveIcon
                className={cn(
                  'h-4 w-4 transition-transform',
                  userReaction && 'fill-current scale-110'
                )}
              />
            )}
            {totalReactions > 0 && (
              <span className="text-sm font-medium tabular-nums">{totalReactions}</span>
            )}
            {totalReactions === 0 && (
              <span className="text-sm font-medium">Reagir</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-1.5 flex gap-1"
          side="top"
          align="start"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {(['like', 'love', 'laugh'] as ReactionType[]).map((type) => {
            const config = reactionConfig[type];
            const Icon = config.icon;
            const isActive = userReaction === type;
            const count = reactionCounts[type];
            return (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleReact(type)}
                className={cn(
                  'h-10 px-3 gap-1.5 rounded-full transition-all duration-200 hover:scale-110',
                  isActive && `${config.bgColor} ${config.color}`
                )}
                title={config.label}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform hover:scale-125',
                    isActive && 'fill-current'
                  )}
                />
                {count > 0 && (
                  <span className="text-xs font-medium tabular-nums">{count}</span>
                )}
              </Button>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}

