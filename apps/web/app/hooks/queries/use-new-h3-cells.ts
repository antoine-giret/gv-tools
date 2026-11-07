import { TPeriod, TUser } from '@repo/models';
import { useQuery } from '@tanstack/react-query';

import { fetchApi } from '../../utils/fetch-api';
import { getPeriodBounds } from '../../utils/period';

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

  const { start, end } = getPeriodBounds(period);

  return useQuery({
    queryKey: ['newH3Cells', userId, start.toISOString(), end.toISOString(), syncedAt?.getTime()],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
      });

      const response = await fetchApi(`/api/users/${userId}/new_h3_cells?${searchParams}`);

      const { h3_indexes } = (await response.json()) as { h3_indexes: string[] };

      return new Set(h3_indexes);
    },
    // Every tile is new over all time
    enabled: !!userId && !!syncedAt && period.type !== 'allTime',
  });
}
