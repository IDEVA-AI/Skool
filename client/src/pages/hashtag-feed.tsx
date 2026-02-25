import { useParams } from 'wouter';
import { Hash, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PostComponent } from '@/components/social/post';
import { toSocialPost } from '@/lib/post-mappers';
import { usePostsByHashtag } from '@/hooks/use-hashtags';
import { useLocation } from 'wouter';

export default function HashtagFeedPage() {
  const params = useParams<{ tag: string }>();
  const tag = params.tag;
  const [, setLocation] = useLocation();

  const { data: posts = [], isLoading } = usePostsByHashtag(tag);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Hash className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{tag}</h1>
        </div>
        <span className="text-sm text-muted-foreground ml-2">
          {posts.length} {posts.length === 1 ? 'publicacao' : 'publicacoes'}
        </span>
      </div>

      {/* Posts */}
      {isLoading ? (
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
        <div className="py-16 text-center text-muted-foreground">
          <Hash className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Nenhuma publicacao com #{tag}</p>
        </div>
      )}
    </div>
  );
}
