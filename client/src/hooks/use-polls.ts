import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as pollsService from '@/services/polls';

export function usePoll(postId: number) {
  return useQuery({
    queryKey: ['poll', postId],
    queryFn: () => pollsService.getPollByPostId(postId),
    enabled: postId > 0,
  });
}

export function useVotePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) =>
      pollsService.votePoll(pollId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll'] });
    },
  });
}

export function useRemovePollVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pollId, optionId }: { pollId: string; optionId: string }) =>
      pollsService.removePollVote(pollId, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poll'] });
    },
  });
}

export function useCreatePoll() {
  return useMutation({
    mutationFn: ({ postId, question, options, closesAt, allowMultiple }: {
      postId: number;
      question: string;
      options: string[];
      closesAt?: string;
      allowMultiple?: boolean;
    }) => pollsService.createPoll(postId, question, options, closesAt, allowMultiple),
  });
}
