import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Book, MessageSquare, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-user-role";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Cursos", href: "/courses", icon: Book },
  { name: "Comunidade", href: "/community", icon: MessageSquare },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const isAdmin = useIsAdmin();

  const currentUser = user ? {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || user.email || 'U')}`,
  } : null;

  const allNavigation = isAdmin === true
    ? [...navigation, { name: "Admin", href: "/admin", icon: Settings }]
    : navigation;

  return (
    <aside className="w-60 border-r bg-white flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="h-16 border-b flex items-center px-6">
        <h1 className="text-xl font-bold text-gray-900">S-K-O-O-L</h1>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-4 space-y-1">
          {allNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Info */}
      {currentUser && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-gray-700 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      )}
    </aside>
  );
}

