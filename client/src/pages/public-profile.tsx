import { useParams } from 'wouter';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, UserMinus, Loader2, Calendar } from 'lucide-react';
import { usePublicProfile, useUserPosts, useIsFollowing, useFollow, useUnfollow } from '@/hooks/use-social-graph';
import { useAuth } from '@/hooks/use-auth';
import { PostComponent } from '@/components/social/post';
import { toSocialPost } from '@/lib/post-mappers';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const { user } = useAuth();
  const isOwnProfile = user?.id === userId;

  const { data: profile, isLoading: profileLoading } = usePublicProfile(userId);
  const { data: posts = [], isLoading: postsLoading } = useUserPosts(userId);
  const { data: following = false } = useIsFollowing(userId);
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  const handleFollowToggle = () => {
    if (!userId) return;
    if (following) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  if (profileLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-muted-foreground">Usuario nao encontrado</p>
      </div>
    );
  }

  const displayName = profile.name || profile.email?.split('@')[0] || 'Usuario';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-start gap-5">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{displayName}</h1>
                {profile.role === 'admin' && (
                  <span className="text-xs font-medium text-primary">Admin</span>
                )}
              </div>

              {!isOwnProfile && (
                <Button
                  variant={following ? 'outline' : 'default'}
                  size="sm"
                  onClick={handleFollowToggle}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                  className="gap-2"
                >
                  {followMutation.isPending || unfollowMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : following ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      Seguindo
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Seguir
                    </>
                  )}
                </Button>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span><strong className="text-foreground">{profile.follower_count}</strong> seguidores</span>
              <span><strong className="text-foreground">{profile.following_count}</strong> seguindo</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Membro {formatDistanceToNow(new Date(profile.created_at), { addSuffix: false, locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div className="space-y-1">
        <div className="flex items-center gap-4 px-2 pb-2">
          <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground/50">
            Publicacoes
          </span>
          <div className="flex-1 h-px bg-border/30" />
        </div>

        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="divide-y divide-border/30">
            {posts.map((post: any) => (
              <PostComponent
                key={post.id}
                post={toSocialPost(post)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">Nenhuma publicacao ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
