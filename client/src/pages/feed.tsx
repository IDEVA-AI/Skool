import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pin, Plus, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PostModal } from '@/components/post-modal';
import { useAllPosts, useFollowingPosts, useCreatePost } from '@/hooks/use-posts';
import { useCourses, useEnrollments, useGetOrCreateDefaultCourse } from '@/hooks/use-courses';
import { useFeedRealtime } from '@/hooks/use-feed-realtime';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useAnnouncements } from '@/hooks/use-announcements';
import { useIsAdmin } from '@/hooks/use-user-role';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { AnnouncementForm } from '@/components/announcement-form';
import { AnnouncementBanner } from '@/components/announcement-banner';
import { useSelectedCommunity } from '@/contexts/community-context';
import { PostComposerSimple, type PollData } from '@/components/social/post-composer-simple';
import { createPoll } from '@/services/polls';
import { PostComponent } from '@/components/social/post';
import { useSocialContextSafe } from '@/components/social/social-context';
import { useUserRole } from '@/hooks/use-user-role';
import { can } from '@/lib/permissions';
import { toSocialPost } from '@/lib/post-mappers';

function hasTextContent(html: string): boolean {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || '';
  return text.trim().length > 0;
}

export default function Feed() {
  const { user } = useAuth();
  const { selectedCommunity } = useSelectedCommunity();
  const { data: allPosts, isLoading: postsLoading, refetch: refetchPosts } = useAllPosts();
  const { data: announcements } = useAnnouncements();
  const { data: allCourses } = useCourses();
  const { data: enrolledCourseIds = [] } = useEnrollments();
  const createPostMutation = useCreatePost();
  const getOrCreateDefaultCourse = useGetOrCreateDefaultCourse();
  const { toast } = useToast();
  const isAdmin = useIsAdmin();
  const { data: userRole } = useUserRole();
  const socialContext = useSocialContextSafe();

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [feedTab, setFeedTab] = useState<'all' | 'following'>('all');
  const { data: followingPosts } = useFollowingPosts();

  const communityCourses = useMemo(() => {
    if (!allCourses || !selectedCommunity) return [];
    return allCourses.filter(c => c.community_id === selectedCommunity.id);
  }, [allCourses, selectedCommunity]);

  const posts = useMemo(() => {
    if (!allPosts || !communityCourses.length) return [];
    const communityCourseIds = communityCourses.map(c => c.id);
    return allPosts.filter((post: any) => communityCourseIds.includes(post.course_id));
  }, [allPosts, communityCourses]);

  const enrolledCommunityCourses = useMemo(() => {
    return communityCourses.filter(c => enrolledCourseIds.includes(c.id));
  }, [communityCourses, enrolledCourseIds]);

  const defaultCourse = useMemo(() => {
    return enrolledCommunityCourses.length > 0
      ? enrolledCommunityCourses[0]
      : communityCourses.length > 0
        ? communityCourses[0]
        : null;
  }, [enrolledCommunityCourses, communityCourses]);

  const sortedPosts = useMemo(() => {
    const basePosts = feedTab === 'following'
      ? (followingPosts || []).filter((p: any) => {
          const communityCourseIds = communityCourses.map(c => c.id);
          return communityCourseIds.includes(p.course_id);
        })
      : posts;

    return [...basePosts].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
  }, [posts, followingPosts, feedTab, communityCourses]);

  const canCreate = socialContext?.permissions.canCreate ?? can(user, userRole || null, 'create');

  const currentUser = socialContext?.currentUser ?? (user ? {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.name || user.email || 'U')}`,
  } : null);

  const handleCreatePost = async (title: string, content: string, poll?: PollData) => {
    if (!user || !defaultCourse) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel criar o post. Verifique se voce esta inscrito em algum curso.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const course = await getOrCreateDefaultCourse.mutateAsync({
        communityId: selectedCommunity?.id || 0,
      });

      const post = await createPostMutation.mutateAsync({
        title,
        content,
        courseId: course.id,
      });

      if (poll && post?.id) {
        await createPoll(post.id, poll.question, poll.options);
      }

      toast({
        title: 'Post criado!',
        description: poll ? 'Seu post com enquete foi publicado com sucesso.' : 'Seu post foi publicado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar post',
        description: error.message || 'Nao foi possivel criar o post.',
        variant: 'destructive',
      });
    }
  };

  // Real-time feed: listen for new posts
  const communityCourseIds = useMemo(() => communityCourses.map(c => c.id), [communityCourses]);
  const { hasNewPosts, newPostCount, dismissNewPosts } = useFeedRealtime({
    courseIds: communityCourseIds,
    enabled: communityCourseIds.length > 0,
  });

  const handleShowNewPosts = useCallback(() => {
    dismissNewPosts();
    refetchPosts();
  }, [dismissNewPosts, refetchPosts]);

  // Deep-link from notifications: open a specific post
  useEffect(() => {
    const openPostId = sessionStorage.getItem('openPostId');
    if (openPostId && allPosts) {
      sessionStorage.removeItem('openPostId');
      const postIdNum = parseInt(openPostId);
      const post = allPosts.find((p: any) => p.id === postIdNum);
      if (post) {
        setSelectedPost(post);
      }
    }
  }, [allPosts]);

  if (postsLoading) {
    return (
      <div className="feed-grain">
        <div className="max-w-2xl mx-auto space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-8 px-6 border-b border-zinc-100" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-3 mb-5">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-20 rounded" />
                  <Skeleton className="h-2.5 w-14 rounded" />
                </div>
              </div>
              <Skeleton className="h-6 w-3/4 mb-3 rounded" />
              <Skeleton className="h-4 w-full mb-2 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="feed-grain">
      <div className="max-w-2xl mx-auto">
        {/* Announcements */}
        {isAdmin && announcements && announcements.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground/60">
                Avisos
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                onClick={() => setShowAnnouncementForm(true)}
              >
                <Plus className="h-3 w-3" />
                Novo
              </Button>
            </div>
            {announcements
              .filter((a: any) => a && a.id)
              .map((announcement: any) => (
                <AnnouncementBanner
                  key={announcement.id}
                  announcement={announcement}
                  isAdmin={isAdmin}
                />
              ))}
          </div>
        )}

        {/* Post Composer */}
        {canCreate && currentUser && (
          <div className="mb-2">
            <PostComposerSimple
              avatar={currentUser.avatar}
              name={currentUser.name}
              onPublish={handleCreatePost}
              isPublishing={createPostMutation.isPending}
            />
          </div>
        )}

        {/* New posts banner */}
        {hasNewPosts && (
          <div className="px-2 py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowNewPosts}
              className="w-full h-9 gap-2 text-xs font-medium text-primary border-primary/30 hover:bg-primary/5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {newPostCount} {newPostCount === 1 ? 'nova publicacao' : 'novas publicacoes'} — clique para ver
            </Button>
          </div>
        )}

        {/* Feed tabs */}
        <div className="flex items-center gap-1 px-2 pt-4 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFeedTab('all')}
            className={cn(
              'h-7 px-3 text-xs font-medium rounded-full',
              feedTab === 'all'
                ? 'bg-foreground text-background hover:bg-foreground/90'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Para todos
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFeedTab('following')}
            className={cn(
              'h-7 px-3 text-xs font-medium rounded-full',
              feedTab === 'following'
                ? 'bg-foreground text-background hover:bg-foreground/90'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Seguindo
          </Button>
          <div className="flex-1 h-px bg-border/30 ml-2" />
        </div>

        {/* Posts */}
        {sortedPosts.length > 0 ? (
          <div className="divide-y divide-border/30">
            {sortedPosts.map((post: any, index: number) => (
              <div
                key={post.id}
                className="feed-item-animate"
                style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
              >
                <PostComponent
                  post={toSocialPost(post, post.reactions)}
                  onPostClick={() => setSelectedPost(post)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center feed-item-animate">
            <p className="text-2xl font-semibold text-zinc-400 mb-2">
              Nenhuma publicacao ainda
            </p>
            <p className="text-sm text-zinc-400">
              Seja o primeiro a compartilhar algo com a comunidade.
            </p>
          </div>
        )}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Announcement Modal */}
      {showAnnouncementForm && (
        <AnnouncementForm
          isOpen={showAnnouncementForm}
          onClose={() => setShowAnnouncementForm(false)}
        />
      )}
    </div>
  );
}
