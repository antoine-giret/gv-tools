import { TUser } from '@repo/models';
import { useQuery } from '@tanstack/react-query';

export function useTracesSync(user: TUser | null | undefined) {
  const userId = user?.id;

  return useQuery({
    queryKey: ['tracesSync', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/traces_sync`, { method: 'POST' });
      if (!response.ok) throw new Error(`Traces sync responded ${response.status}`);

      const { traces_synced_at } = (await response.json()) as { traces_synced_at: string };

      return new Date(traces_synced_at);
    },
    enabled: !!userId,
    // Fetches the new traces when the user comes back to the app
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useTracesSyncProgress(user: TUser | null | undefined, syncing: boolean) {
  const userId = user?.id;

  return useQuery({
    queryKey: ['tracesSyncProgress', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/traces_sync`);
      if (!response.ok) throw new Error(`Traces sync progress responded ${response.status}`);

      const { progress } = (await response.json()) as {
        progress: { page: number; pages: number | null } | null;
      };

      return progress;
    },
    enabled: !!userId && syncing,
    refetchInterval: 2000,
  });
}
