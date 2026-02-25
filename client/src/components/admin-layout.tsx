import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  FileVideo,
  Settings,
  Home,
  ChevronRight,
  Menu,
  LogOut,
  Users as UsersIcon,
  ShoppingCart,
  Unlock,
  Flag
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminCommunityProvider, useAdminCommunity } from "@/contexts/admin-community-context";
import { useOwnedCommunities } from "@/hooks/use-communities";

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Comunidades", href: "/admin/communities", icon: UsersIcon },
  { name: "Cursos", href: "/admin/courses", icon: BookOpen },
  { name: "Media Library", href: "/admin/media", icon: FileVideo },
  { name: "Integrações", href: "/admin/integrations", icon: ShoppingCart },
  { name: "Páginas de Desbloqueio", href: "/admin/unlock-pages", icon: Unlock },
  { name: "Moderação", href: "/admin/moderation", icon: Flag },
  { name: "Configurações", href: "/admin/settings", icon: Settings },
];

function CommunityPicker() {
  const { data: communities } = useOwnedCommunities();
  const { selectedCommunityId, setSelectedCommunityId } = useAdminCommunity();

  if (!communities || communities.length <= 1) return null;

  return (
    <div className="px-4 pb-2">
      <Select
        value={selectedCommunityId || "all"}
        onValueChange={(value) => setSelectedCommunityId(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full h-9 text-xs">
          <SelectValue placeholder="Todas as comunidades" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as comunidades</SelectItem>
          {communities.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminCommunityProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminCommunityProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado',
    });
    setLocation('/login');
  };

  const currentUser = user ? {
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || user.email || 'A')}`,
  } : null;

  return (
    <div className="min-h-screen bg-zinc-50/50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30 border-r border-zinc-200 bg-white">
        <div className="h-full flex flex-col">
          {/* Logo/Header */}
          <div className="h-16 border-b border-zinc-100 flex items-center px-6">
            <Link href="/admin">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
                  A
                </div>
                <span className="font-semibold text-lg text-zinc-900">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Community Picker */}
          <div className="pt-4">
            <CommunityPicker />
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="flex flex-col gap-1 px-4">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 px-3 py-2.5",
                        isActive
                          ? "bg-zinc-100 text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-zinc-900" : "text-zinc-400")} />
                      <span>{item.name}</span>
                      {isActive && <ChevronRight className="h-4 w-4 ml-auto text-zinc-400" />}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Section */}
          <div className="border-t border-zinc-100 p-4">
            {currentUser && (
              <>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 mb-3">
                  <Avatar className="h-9 w-9 border border-zinc-200">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name[0]?.toUpperCase() || 'A'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-zinc-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-zinc-400 truncate">Administrador</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <Link href="/">Voltar ao Site</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-xs text-zinc-400 hover:text-destructive"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Sair
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r border-zinc-200">
          <div className="h-full flex flex-col">
            <div className="h-16 border-b border-zinc-100 flex items-center px-6">
              <span className="font-semibold text-lg text-zinc-900">Admin Panel</span>
            </div>
            <div className="pt-4">
              <CommunityPicker />
            </div>
            <ScrollArea className="flex-1 py-4">
              <nav className="flex flex-col gap-1 px-4">
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href || (item.href !== "/admin" && location.startsWith(item.href));
                  return (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={cn(
                          "flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 px-3 py-2.5",
                          isActive
                            ? "bg-zinc-100 text-zinc-900"
                            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                        )}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-zinc-900" : "text-zinc-400")} />
                        <span>{item.name}</span>
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden h-14 border-b border-zinc-100 flex items-center px-4 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
          <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setIsMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold ml-2">Admin Panel</span>
        </div>

        {/* Desktop Top Bar */}
        <div className="hidden md:flex h-16 items-center px-8 border-b border-zinc-100 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-semibold text-zinc-900">Painel Administrativo</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">Voltar ao Site</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
