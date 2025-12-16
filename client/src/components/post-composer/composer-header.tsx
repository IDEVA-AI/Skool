import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ComposerHeaderProps {
  avatar?: string;
  name: string;
  context?: string;
  contextHighlight?: string;
}

export function ComposerHeader({
  avatar,
  name,
  context,
  contextHighlight,
}: ComposerHeaderProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 mb-2">
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1 text-sm">
        <span className="font-semibold text-foreground">{name}</span>
        {context && (
          <>
            <span className="text-muted-foreground">publicando em</span>
            <span className="font-medium text-primary">
              {contextHighlight || context}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

