import { useState } from 'react';
import { Image, Video, Link as LinkIcon, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PostBlock } from '@/types/social';

interface MediaToolbarProps {
  onAddBlock: (type: PostBlock['type'], content?: string, metadata?: PostBlock['metadata']) => void;
  className?: string;
}

export function MediaToolbar({ onAddBlock, className }: MediaToolbarProps) {
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const handleAddText = () => {
    onAddBlock('text');
  };

  const handleAddImage = () => {
    // In a real app, this would open a file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          onAddBlock('image', url, { url, alt: file.name });
          // In a real app, you'd upload the file and get a URL
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAddVideoClick = () => {
    setVideoUrl('');
    setVideoDialogOpen(true);
  };

  const handleVideoSubmit = () => {
    if (videoUrl.trim()) {
      onAddBlock('video', videoUrl.trim(), { url: videoUrl.trim() });
      setVideoDialogOpen(false);
      setVideoUrl('');
    }
  };

  const handleAddLinkClick = () => {
    setLinkUrl('');
    setLinkDialogOpen(true);
  };

  const handleLinkSubmit = () => {
    if (linkUrl.trim()) {
      onAddBlock('link', linkUrl.trim(), { url: linkUrl.trim() });
      setLinkDialogOpen(false);
      setLinkUrl('');
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddText}
                className="h-8 w-8 p-0"
                aria-label="Adicionar texto"
              >
                <Type className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar texto</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddImage}
                className="h-8 w-8 p-0"
                aria-label="Adicionar imagem"
              >
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar imagem</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddVideoClick}
                className="h-8 w-8 p-0"
                aria-label="Adicionar vídeo"
              >
                <Video className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar vídeo</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddLinkClick}
                className="h-8 w-8 p-0"
                aria-label="Adicionar link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Dialog para adicionar vídeo */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Vídeo</DialogTitle>
            <DialogDescription>
              Cole a URL do vídeo (YouTube, Vimeo, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">URL do Vídeo</Label>
              <Input
                id="video-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleVideoSubmit();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleVideoSubmit} disabled={!videoUrl.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar link */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Link</DialogTitle>
            <DialogDescription>
              Cole a URL do link que deseja compartilhar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL do Link</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleLinkSubmit();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLinkSubmit} disabled={!linkUrl.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

