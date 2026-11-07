import { TPeriod, TUser } from '@repo/models';
import { useQuery } from '@tanstack/react-query';

import { fetchApi } from '../../utils/fetch-api';

export type TStatsData = {
  count: number;
  data: Array<{ count: number; distance: number; duration: number; unit: number }>;
  distance: number;
  duration: number;
};

export function useStats({
  user,
  period,
}: {
  user: TUser | null | undefined;
  period: TPeriod | null;
}) {
  const userId = user?.id;
  const startDateFormatted =
    period?.startDate.toISOString().split('T')[0]?.split('-').reverse().join('-') || '';
  const endDateFormatted =
    period?.endDate.toISOString().split('T')[0]?.split('-').reverse().join('-') || '';

  return useQuery({
    queryKey: ['stats', userId, startDateFormatted, endDateFormatted],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        period: 'custom',
        date_start: startDateFormatted,
        date_end: endDateFormatted,
        unit: 'day',
      });

      const response = await fetchApi(`/api/users/${userId}/stats_traces?${searchParams}`);

      return response.json() as Promise<TStatsData>;
    },
    enabled: !!userId && !!period,
  });
}
