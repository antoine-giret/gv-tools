import { TUser } from '@repo/models';
import { useQuery } from '@tanstack/react-query';

import { ApiError, fetchApi } from '../../utils/fetch-api';

export function useTracesSync(user: TUser | null | undefined) {
  const userId = user?.id;

  return useQuery({
    queryKey: ['tracesSync', userId],
    queryFn: async () => {
      const response = await fetchApi(`/api/users/${userId}/traces_sync`, { method: 'POST' });

      const { traces_synced_at } = (await response.json()) as { traces_synced_at: string };

      return new Date(traces_synced_at);
    },
    enabled: !!userId,
    // Fetches the new traces when the user comes back to the app
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 401) && failureCount < 1,
  });
}

export function useTracesSyncProgress(user: TUser | null | undefined, syncing: boolean) {
  const userId = user?.id;

  return useQuery({
    queryKey: ['tracesSyncProgress', userId],
    queryFn: async () => {
      const response = await fetchApi(`/api/users/${userId}/traces_sync`);

      const { progress } = (await response.json()) as {
        progress: { page: number; pages: number | null } | null;
      };

      return progress;
    },
    enabled: !!userId && syncing,
    refetchInterval: 2000,
  });
}
