import { TPeriod, TPeriodType } from '@repo/models';

export function getInitialPeriod(periodType: TPeriodType): TPeriod {
  const startDate = new Date();
  const endDate = new Date();

  switch (periodType) {
    case 'week':
      const day = startDate.getDay();

      startDate.setDate(startDate.getDate() - day + (day == 0 ? -6 : 1));
      endDate.setDate(endDate.getDate() - day + (day == 0 ? 0 : 7));

      break;
    case 'month':
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1, 0);

      break;
    case 'year':
      startDate.setMonth(0, 1);
      endDate.setMonth(11, 31);

      break;
    default:
      break;
  }

  startDate.setHours(12, 0, 0, 0);
  endDate.setHours(12, 0, 0, 0);

  return { type: periodType, startDate, endDate };
}
