import { TPeriod, TPeriodType } from '@repo/models';
import { match } from 'ts-pattern';

export function getInitialPeriod(periodType: Exclude<TPeriodType, 'allTime'>): TPeriod {
  const startDate = new Date();
  const endDate = new Date();

  match(periodType)
    .with('week', () => {
      const day = startDate.getDay();

      startDate.setDate(startDate.getDate() - day + (day == 0 ? -6 : 1));
      endDate.setDate(endDate.getDate() - day + (day == 0 ? 0 : 7));
    })
    .with('month', () => {
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1, 0);
    })
    .with('year', () => {
      startDate.setMonth(0, 1);
      endDate.setMonth(11, 31);
    })
    .exhaustive();

  startDate.setHours(12, 0, 0, 0);
  endDate.setHours(12, 0, 0, 0);

  return { type: periodType, startDate, endDate };
}
