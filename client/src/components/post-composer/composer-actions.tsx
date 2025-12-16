import {
  Paperclip,
  Link as LinkIcon,
  Youtube,
  BarChart2,
  Smile,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ComposerActionsProps {
  onAttach?: () => void;
  onLink?: () => void;
  onVideo?: () => void;
  onPoll?: () => void;
  onEmoji?: () => void;
  onGif?: () => void;
}

export function ComposerActions({
  onAttach,
  onLink,
  onVideo,
  onPoll,
  onEmoji,
  onGif,
}: ComposerActionsProps) {
  return (
    <div className="flex items-center gap-4 text-muted-foreground">
      <TooltipProvider>
        {onAttach && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onAttach}
                className="hover:text-primary transition-colors"
                aria-label="Anexar arquivo"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Anexar arquivo</p>
            </TooltipContent>
          </Tooltip>
        )}

        {onLink && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onLink}
                className="hover:text-primary transition-colors"
                aria-label="Inserir link"
              >
                <LinkIcon className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Inserir link</p>
            </TooltipContent>
          </Tooltip>
        )}

        {onVideo && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onVideo}
                className="hover:text-primary transition-colors"
                aria-label="Inserir vídeo"
              >
                <Youtube className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Inserir vídeo</p>
            </TooltipContent>
          </Tooltip>
        )}

        {onPoll && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onPoll}
                className="hover:text-primary transition-colors"
                aria-label="Criar enquete"
              >
                <BarChart2 className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Criar enquete</p>
            </TooltipContent>
          </Tooltip>
        )}

        {onEmoji && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onEmoji}
                className="hover:text-primary transition-colors"
                aria-label="Inserir emoji"
              >
                <Smile className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Inserir emoji</p>
            </TooltipContent>
          </Tooltip>
        )}

        {onGif && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onGif}
                className="h-auto px-2 py-0.5 text-xs font-bold border-current hover:text-primary"
                aria-label="Inserir GIF"
              >
                GIF
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Inserir GIF</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
}

