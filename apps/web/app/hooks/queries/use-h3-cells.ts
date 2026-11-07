import { TPeriod, TUser } from '@repo/models';
import { useQuery } from '@tanstack/react-query';

import { fetchApi } from '../../utils/fetch-api';
import { getPeriodBounds } from '../../utils/period';

import { useTracesSync } from './use-traces-sync';

export function useH3Cells({ user, period }: { user: TUser | null | undefined; period: TPeriod }) {
  const userId = user?.id;
  const { data: syncedAt } = useTracesSync(user);
  const { start, end } = getPeriodBounds(period);
  const allTime = period.type === 'allTime';

  return useQuery({
    queryKey: [
      'h3Cells',
      userId,
      allTime ? 'allTime' : start.toISOString(),
      allTime ? null : end.toISOString(),
      syncedAt?.getTime(),
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (!allTime) {
        searchParams.set('start', start.toISOString());
        searchParams.set('end', end.toISOString());
      }

      const response = await fetchApi(`/api/users/${userId}/h3_cells?${searchParams}`);
      const { h3_indexes } = (await response.json()) as { h3_indexes: string[] };

      return new Set(h3_indexes);
    },
    enabled: !!userId && !!syncedAt,
  });
}
