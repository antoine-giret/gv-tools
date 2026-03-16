import { TPeriod, TUser } from '@repo/models';
import { useQuery } from '@tanstack/react-query';

import { geoveloFetch } from '../../utils/fetcher';

export function useStats({ user, period }: { user: TUser | null | undefined; period: TPeriod }) {
  const userId = user?.id;
  const { startDate, endDate } = period;
  const startDateFormatted =
    startDate.toISOString().split('T')[0]?.split('-').reverse().join('-') || '';
  const endDateFormatted =
    endDate.toISOString().split('T')[0]?.split('-').reverse().join('-') || '';

  return useQuery({
    queryKey: ['stats', userId, startDateFormatted, endDateFormatted],
    queryFn: async () => {
      const queryParams = [
        { key: 'period', value: 'custom' },
        { key: 'date_start', value: startDateFormatted },
        { key: 'date_end', value: endDateFormatted },
        { key: 'unit', value: 'day' },
      ];

      return geoveloFetch<{
        count: number;
        data: Array<{ count: number; distance: number; duration: number; unit: number }>;
        distance: number;
        duration: number;
      }>({
        endpoint: `/v2/users/${userId}/stats_traces`,
        queryParams,
        user,
      });
    },
    enabled: !!userId,
  });
}
