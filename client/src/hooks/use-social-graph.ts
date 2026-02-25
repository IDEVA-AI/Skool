import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as usersService from '@/services/users';

export function usePublicProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['public-profile', userId],
    queryFn: () => usersService.getPublicProfile(userId!),
    enabled: !!userId,
  });
}

export function useUserPosts(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => usersService.getPostsByUser(userId!),
    enabled: !!userId,
  });
}

export function useIsFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: ['is-following', userId],
    queryFn: () => usersService.isFollowing(userId!),
    enabled: !!userId,
  });
}

export function useFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersService.followUser(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['is-following', userId] });
      queryClient.invalidateQueries({ queryKey: ['public-profile', userId] });
    },
  });
}

export function useUnfollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersService.unfollowUser(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['is-following', userId] });
      queryClient.invalidateQueries({ queryKey: ['public-profile', userId] });
    },
  });
}

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ['user-search', query],
    queryFn: () => usersService.searchUsers(query),
    enabled: query.length >= 2,
  });
}
