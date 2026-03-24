import { TPeriod, TUser } from '@repo/models';
import { useQuery } from '@tanstack/react-query';

import { geoveloFetch } from '../../utils/fetcher';

export function useCommutesToWork({ user }: { user: TUser | null | undefined }) {
  const userId = user?.id;

  return useQuery({
    queryKey: ['commuteToWork', userId],
    queryFn: async () => {
      return geoveloFetch<{
        results: Array<{
          id: number;
          distance_in_meters_end_start: number;
          distance_in_meters_start_end: number;
          enabled: boolean;
          geo_end: GeoJSON.Point;
          geo_end_title: string;
          geo_start: GeoJSON.Point;
          geo_start_title: string;
        }>;
      }>({
        endpoint: `/v3/users/${userId}/reference_trips`,
        user,
      });
    },
    enabled: !!userId,
  });
}

export function useCommutesToWorkOccurrences({
  user,
  commuteToWorkIds,
  period,
}: {
  commuteToWorkIds: number[] | undefined;
  user: TUser | null | undefined;
  period: TPeriod;
}) {
  const userId = user?.id;
  const { startDate, endDate } = period;
  const startDateFormatted =
    startDate.toISOString().split('T')[0]?.split('-').reverse().join('-') || '';
  const endDateFormatted =
    endDate.toISOString().split('T')[0]?.split('-').reverse().join('-') || '';

  return useQuery({
    queryKey: ['commuteToWorkOccurrences', userId, startDateFormatted, endDateFormatted],
    queryFn: async () => {
      const queryParams = [
        { key: 'period', value: 'custom' },
        { key: 'date_start', value: startDateFormatted },
        { key: 'date_end', value: endDateFormatted },
      ];

      const results = await Promise.all(
        commuteToWorkIds?.map((commuteToWorkId) =>
          geoveloFetch<{
            results: Array<{
              candidate: boolean;
              date: string;
              direction: 'OUTWARD' | 'RETURN';
              id: number;
              enabled: boolean;
              user_reference_trip: number;
            }>;
          }>({
            endpoint: `/v3/users/${userId}/reference_trips/${commuteToWorkId}/occurrences`,
            queryParams,
            user,
          }),
        ) || [],
      );

      return results.flatMap(({ results }) => results);
    },
    enabled: !!userId && !!commuteToWorkIds,
  });
}
