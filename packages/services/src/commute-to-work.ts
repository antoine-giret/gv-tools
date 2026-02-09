import { TPeriod } from '@repo/models';

import { HttpService } from './http';

export class CommuteToWorkService {
  static async fetchCommutesToWork<T extends object>({ userId }: { userId: number }) {
    return HttpService.get<T>({ apiVersion: 3, endpoint: `/users/${userId}/reference_trips` });
  }

  static async fetchCommuteToWorkOccurrences<T extends object>({
    userId,
    commuteToWorkId,
    period,
  }: {
    commuteToWorkId: number;
    period: TPeriod;
    userId: number;
  }) {
    const { startDate, endDate } = period;
    const startDateFormatted =
      startDate.toISOString().split('T')[0]?.split('-').reverse().join('-') || '';
    const endDateFormatted =
      endDate.toISOString().split('T')[0]?.split('-').reverse().join('-') || '';

    return HttpService.get<T>({
      apiVersion: 3,
      endpoint: `/users/${userId}/reference_trips/${commuteToWorkId}/occurrences`,
      queryParams: [
        { key: 'period', value: 'custom' },
        { key: 'date_start', value: startDateFormatted },
        { key: 'date_end', value: endDateFormatted },
      ],
    });
  }
}
