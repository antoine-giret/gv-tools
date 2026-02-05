import { useMemo } from 'react';

import { Card } from '../../../components';
import { TPeriod } from '../../../utils/period';
import { weekDays, weekDaysMap } from '../../stats/types';

import { Day } from './day';

export function Calendar({ period }: { period: TPeriod }) {
  const prevMonthDays = useMemo(() => {
    const firstDay = period.startDate.getDay();

    return new Array(firstDay === 0 ? 6 : firstDay - 1)
      .fill(null)
      .map((_, index) => {
        const date = new Date(period.startDate);
        date.setDate(date.getDate() - index - 1);

        return { index, date };
      })
      .reverse();
  }, [period]);
  const days = useMemo(() => {
    const days: Array<{ index: number; date: Date }> = [];
    const { startDate, endDate } = period;
    const currentDay = new Date(startDate);
    let index = 0;
    while (currentDay.getTime() <= endDate.getTime()) {
      days.push({ index, date: new Date(currentDay) });
      currentDay.setDate(currentDay.getDate() + 1);
      ++index;
    }

    return days;
  }, [period]);
  const nextMonthDays = useMemo(() => {
    const lastDay = period.endDate.getDay();

    return new Array(lastDay === 0 ? 0 : 7 - lastDay).fill(null).map((_, index) => {
      const date = new Date(period.endDate);
      date.setDate(date.getDate() + index + 1);

      return { index, date };
    });
  }, [period]);

  return (
    <Card>
      <div className="grid grid-cols-7 gap-3 p-3">
        {weekDays.map((index) => {
          const { shortLabel } = weekDaysMap[index];

          return (
            <div className="flex flex-col items-center gap-2" key={index}>
              <span className="text-sm font-bold text-black dark:text-white capitalize">
                {shortLabel}
              </span>
            </div>
          );
        })}
        {prevMonthDays.map((day) => (
          <Day inAnotherMonth day={day} key={day.index} />
        ))}
        {days.map((day) => (
          <Day day={day} key={day.index} />
        ))}
        {nextMonthDays.map((day) => (
          <Day inAnotherMonth day={day} key={day.index} />
        ))}
      </div>
    </Card>
  );
}
