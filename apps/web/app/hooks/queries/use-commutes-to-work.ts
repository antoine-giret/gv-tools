import { TPeriod, TUser } from '@repo/models';
import { useQuery } from '@tanstack/react-query';

export function useCommutesToWork({ user }: { user: TUser | null | undefined }) {
  const userId = user?.id;

  return useQuery({
    queryKey: ['commuteToWork', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/reference_trips`);

      return response.json() as Promise<{
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
      }>;
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
      const searchParams = new URLSearchParams({
        period: 'custom',
        date_start: startDateFormatted,
        date_end: endDateFormatted,
      });

      const results = await Promise.all(
        commuteToWorkIds?.map(async (commuteToWorkId) => {
          const response = await fetch(
            `/api/users/${userId}/reference_trips/${commuteToWorkId}/occurrences?${searchParams}`,
          );

          return response.json() as Promise<{
            results: Array<{
              candidate: boolean;
              date: string;
              direction: 'OUTWARD' | 'RETURN';
              id: number;
              enabled: boolean;
              user_reference_trip: number;
            }>;
          }>;
        }) || [],
      );

      return results.flatMap(({ results }) => results);
    },
    enabled: !!userId && !!commuteToWorkIds,
  });
}
