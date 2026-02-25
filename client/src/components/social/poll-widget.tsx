import { usePoll, useVotePoll, useRemovePollVote } from '@/hooks/use-polls';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Clock, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PollWidgetProps {
  postId: number;
}

export function PollWidget({ postId }: PollWidgetProps) {
  const { user } = useAuth();
  const { data: poll, isLoading } = usePoll(postId);
  const voteMutation = useVotePoll();
  const removeMutation = useRemovePollVote();

  if (isLoading || !poll) return null;

  const hasVoted = poll.user_votes.length > 0;
  const isClosed = poll.closes_at ? new Date(poll.closes_at) < new Date() : false;
  const showResults = hasVoted || isClosed;

  const handleVote = (optionId: string) => {
    if (isClosed) return;

    if (poll.user_votes.includes(optionId)) {
      removeMutation.mutate({ pollId: poll.id, optionId });
    } else {
      voteMutation.mutate({ pollId: poll.id, optionId });
    }
  };

  const maxVotes = Math.max(...poll.options.map(o => o.vote_count), 1);

  return (
    <div className="mt-4 p-4 border border-border/50 rounded-lg bg-muted/20">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-semibold">{poll.question}</h4>
      </div>

      <div className="space-y-2">
        {poll.options.map(option => {
          const isSelected = poll.user_votes.includes(option.id);
          const percentage = poll.total_votes > 0
            ? Math.round((option.vote_count / poll.total_votes) * 100)
            : 0;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isClosed || voteMutation.isPending || removeMutation.isPending}
              className={cn(
                'relative w-full text-left px-3 py-2.5 rounded-md border transition-all text-sm',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border/50 hover:border-border',
                isClosed && 'cursor-default'
              )}
            >
              {/* Progress bar background */}
              {showResults && (
                <div
                  className={cn(
                    'absolute inset-0 rounded-md transition-all',
                    isSelected ? 'bg-primary/10' : 'bg-muted/50'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  <span className={cn('font-medium', isSelected && 'text-primary')}>
                    {option.text}
                  </span>
                </div>
                {showResults && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        <span>{poll.total_votes} {poll.total_votes === 1 ? 'voto' : 'votos'}</span>
        {poll.closes_at && !isClosed && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Encerra {formatDistanceToNow(new Date(poll.closes_at), { addSuffix: true, locale: ptBR })}
          </span>
        )}
        {isClosed && (
          <span className="text-amber-600">Enquete encerrada</span>
        )}
      </div>
    </div>
  );
}
