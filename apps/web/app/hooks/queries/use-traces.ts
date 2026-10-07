import { TPeriod, TUser } from '@repo/models';
import { useQuery } from '@tanstack/react-query';

export function useTraces({ user, period }: { user: TUser | null | undefined; period: TPeriod }) {
  const userId = user?.id;
  const { startDate, endDate } = period;
  const startDateFormatted = startDate.toISOString().split('T')[0]?.split('-').join('-') || '';
  const endDateFormatted = endDate.toISOString().split('T')[0]?.split('-').join('-') || '';

  return useQuery<GeoJSON.FeatureCollection<GeoJSON.LineString>>({
    queryKey: ['traces', userId, startDateFormatted, endDateFormatted],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        date_start: startDateFormatted,
        date_end: endDateFormatted,
        unit: 'day',
      });

      const response = await fetch(`/api/users/${userId}/simplified_traces?${searchParams}`);
      const res = (await response.json()) as GeoJSON.FeatureCollection<GeoJSON.LineString>;

      return { type: 'FeatureCollection', features: res.features || [] };
    },
    enabled: !!userId,
  });
}
