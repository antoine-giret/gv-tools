import { TPeriod } from '@repo/models';

import { HttpService } from './http';

export class StatsService {
  static async fetchStats<T extends object>({
    userId,
    period,
  }: {
    period: TPeriod;
    userId: number;
  }) {
    const { startDate, endDate } = period;
    const startDateFormatted =
      startDate.toISOString().split('T')[0]?.split('-').reverse().join('-') || '';
    const endDateFormatted =
      endDate.toISOString().split('T')[0]?.split('-').reverse().join('-') || '';

    return HttpService.get<T>({
      apiVersion: 2,
      endpoint: `/users/${userId}/stats_traces`,
      queryParams: [
        { key: 'period', value: 'custom' },
        { key: 'date_start', value: startDateFormatted },
        { key: 'date_end', value: endDateFormatted },
        { key: 'unit', value: 'day' },
      ],
    });
  }
}
