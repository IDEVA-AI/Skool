import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, FileText, BookOpen, User, Loader2 } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useSearch, type SearchResult } from '@/hooks/use-search';

export function SearchCommand() {
  const [, setLocation] = useLocation();
  const { 
    query, 
    setQuery, 
    isOpen, 
    setIsOpen, 
    groupedResults, 
    isLoading,
    clearSearch,
    hasResults 
  } = useSearch();

  // Atalho de teclado Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setIsOpen]);

  const handleSelect = (result: SearchResult) => {
    clearSearch();
    setLocation(result.url);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'post':
        return 'Posts';
      case 'course':
        return 'Cursos';
      case 'user':
        return 'Usuários';
    }
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput 
        placeholder="Buscar posts, cursos, usuários..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {!isLoading && query.length >= 2 && !hasResults && (
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        )}

        {!isLoading && query.length < 2 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Digite pelo menos 2 caracteres para buscar...
          </div>
        )}

        {groupedResults.posts.length > 0 && (
          <CommandGroup heading="Posts">
            {groupedResults.posts.map((result) => (
              <CommandItem
                key={result.id}
                value={result.id}
                onSelect={() => handleSelect(result)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {getIcon(result.type)}
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{result.title}</p>
                  {result.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {result.description}
                    </p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {groupedResults.courses.length > 0 && (
          <CommandGroup heading="Cursos">
            {groupedResults.courses.map((result) => (
              <CommandItem
                key={result.id}
                value={result.id}
                onSelect={() => handleSelect(result)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {getIcon(result.type)}
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{result.title}</p>
                  {result.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {result.description}
                    </p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {groupedResults.users.length > 0 && (
          <CommandGroup heading="Usuários">
            {groupedResults.users.map((result) => (
              <CommandItem
                key={result.id}
                value={result.id}
                onSelect={() => handleSelect(result)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {result.avatar ? (
                  <img 
                    src={result.avatar} 
                    alt={result.title}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  getIcon(result.type)
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{result.title}</p>
                  {result.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {result.description}
                    </p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function SearchTrigger({ className }: { className?: string }) {
  const { setIsOpen } = useSearch();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-md border transition-colors ${className}`}
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Buscar...</span>
      <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
