import { TPeriod, TUser } from '@repo/models';
import { useQuery } from '@tanstack/react-query';

import { useTracesSync } from './use-traces-sync';

export function useNewH3Cells({
  user,
  period,
}: {
  user: TUser | null | undefined;
  period: TPeriod;
}) {
  const userId = user?.id;
  // Refreshed once the sync has stored the latest tiles
  const { data: syncedAt } = useTracesSync(user);

  // Local days of the period, end day included
  const start = new Date(period.startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(period.endDate);
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + 1);

  return useQuery({
    queryKey: ['newH3Cells', userId, start.toISOString(), end.toISOString(), syncedAt?.getTime()],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
      });

      const response = await fetch(`/api/users/${userId}/new_h3_cells?${searchParams}`);
      if (!response.ok) throw new Error(`New H3 cells responded ${response.status}`);

      const { h3_indexes } = (await response.json()) as { h3_indexes: string[] };

      return new Set(h3_indexes);
    },
    // Every tile is new over all time
    enabled: !!userId && !!syncedAt && period.type !== 'allTime',
  });
}
