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
  activeColor: string;
}> = {
  like: {
    icon: ThumbsUp,
    label: 'Curtir',
    activeColor: 'text-blue-500',
  },
  love: {
    icon: Heart,
    label: 'Amar',
    activeColor: 'text-rose-500',
  },
  laugh: {
    icon: Laugh,
    label: 'Rir',
    activeColor: 'text-amber-500',
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
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reactionCounts = reactions.reduce(
    (acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    },
    { like: 0, love: 0, laugh: 0 } as Record<ReactionType, number>
  );

  const totalReactions = reactions.length;

  const topReaction = (Object.entries(reactionCounts) as [ReactionType, number][])
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'like';

  const handleReact = (type: ReactionType) => {
    onReact(type);
    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setIsOpen(true), 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const activeConfig = userReaction ? reactionConfig[userReaction] : null;
  const ActiveIcon = activeConfig?.icon || ThumbsUp;
  const TopReactionIcon = reactionConfig[topReaction].icon;

  const buttonSize = compact ? 'h-6 px-1.5' : 'h-7 px-2.5';
  const iconSize = compact ? 'h-3 w-3' : 'h-3.5 w-3.5';

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
              buttonSize,
              'gap-1.5 rounded-full transition-all duration-200 text-xs',
              userReaction
                ? activeConfig?.activeColor
                : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/60'
            )}
          >
            {totalReactions > 0 ? (
              <TopReactionIcon
                className={cn(
                  iconSize,
                  'transition-transform',
                  userReaction === topReaction && 'fill-current'
                )}
              />
            ) : (
              <ActiveIcon
                className={cn(
                  iconSize,
                  'transition-transform',
                  userReaction && 'fill-current'
                )}
              />
            )}
            {totalReactions > 0 && (
              <span className="tabular-nums">{totalReactions}</span>
            )}
            {totalReactions === 0 && !compact && (
              <span>Reagir</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-1 flex gap-0.5 bg-white shadow-lg border-zinc-200"
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
                  'h-9 px-2.5 gap-1 rounded-full transition-all duration-200',
                  'hover:scale-110',
                  isActive && config.activeColor
                )}
                title={config.label}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isActive && 'fill-current'
                  )}
                />
                {count > 0 && (
                  <span className="text-[11px] tabular-nums">{count}</span>
                )}
              </Button>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}
