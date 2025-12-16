import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export function Topbar() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = user ? {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || user.email || 'U')}`,
  } : null;

  return (
    <header className="h-16 border-b bg-white flex items-center px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar cursos, posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {currentUser && (
          <Avatar className="h-9 w-9 border border-gray-200">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>{currentUser.name[0]?.toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
}

