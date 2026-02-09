import { TPeriod } from '@repo/models';

import { HttpService } from './http';

export class TraceService {
  static async fetchTraces<T extends object>({
    userId,
    period,
  }: {
    period: TPeriod;
    userId: number;
  }) {
    const { startDate, endDate } = period;
    const startDateFormatted = startDate.toISOString().split('T')[0]?.split('-').join('-') || '';
    const endDateFormatted = endDate.toISOString().split('T')[0]?.split('-').join('-') || '';

    return HttpService.get<T>({
      apiVersion: 2,
      endpoint: `/users/${userId}/simplified_traces`,
      queryParams: [
        { key: 'date_start', value: startDateFormatted },
        { key: 'date_end', value: endDateFormatted },
        { key: 'unit', value: 'day' },
      ],
    });
  }
}
