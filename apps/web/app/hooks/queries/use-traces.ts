import { TPeriod, TUser } from '@repo/models';
import { useQuery } from '@tanstack/react-query';

import { geoveloFetch } from '../../utils/fetcher';

export function useTraces({ user, period }: { user: TUser | null | undefined; period: TPeriod }) {
  const userId = user?.id;
  const { startDate, endDate } = period;
  const startDateFormatted = startDate.toISOString().split('T')[0]?.split('-').join('-') || '';
  const endDateFormatted = endDate.toISOString().split('T')[0]?.split('-').join('-') || '';

  return useQuery<GeoJSON.FeatureCollection<GeoJSON.LineString>>({
    queryKey: ['traces', userId, startDateFormatted, endDateFormatted],
    queryFn: async () => {
      const queryParams = [
        { key: 'date_start', value: startDateFormatted },
        { key: 'date_end', value: endDateFormatted },
        { key: 'unit', value: 'day' },
      ];

      const res = await geoveloFetch<GeoJSON.FeatureCollection<GeoJSON.LineString>>({
        endpoint: `/v2/users/${userId}/simplified_traces`,
        queryParams,
        user,
      });

      return { type: 'FeatureCollection', features: res.features || [] };
    },
    enabled: !!userId,
  });
}
