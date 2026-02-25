import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search } from 'lucide-react';
import { useGifSearch, useTrendingGifs } from '@/hooks/use-gifs';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { TenorGif } from '@/services/tenor';

interface GifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (gif: TenorGif) => void;
}

export function GifPicker({ isOpen, onClose, onSelect }: GifPickerProps) {
  const [query, setQuery] = useState('');
  const { data: searchResults = [], isLoading: searching } = useGifSearch(query);
  const { data: trending = [], isLoading: trendingLoading } = useTrendingGifs();

  const gifs = query.length >= 2 ? searchResults : trending;
  const isLoading = query.length >= 2 ? searching : trendingLoading;

  const handleSelect = (gif: TenorGif) => {
    onSelect(gif);
    onClose();
    setQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0">
        <VisuallyHidden>
          <DialogTitle>Escolher GIF</DialogTitle>
        </VisuallyHidden>

        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar GIFs..."
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : gifs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {query.length >= 2 ? 'Nenhum GIF encontrado' : 'Comece a digitar para buscar'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 p-2">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  onClick={() => handleSelect(gif)}
                  className="relative overflow-hidden rounded bg-muted hover:opacity-80 transition-opacity aspect-square"
                >
                  <img
                    src={gif.preview}
                    alt={gif.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t border-border text-center">
          <span className="text-[10px] text-muted-foreground">Powered by Tenor</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
