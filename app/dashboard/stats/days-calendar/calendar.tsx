import { useMemo } from 'react';

import { Tooltip } from '../../../components';
import { TPeriod } from '../../../utils/period';
import { statsMap, TValues, weekDaysMap } from '../types';

const { distance: { format: formatDistance } } = statsMap;

export function Calendar({
  exported,
  period,
  values,
}: {
  exported?: boolean;
  period: TPeriod;
  values: TValues | undefined;
}) {
  const headers = useMemo(() => {
    return new Array(28)
      .fill(null)
      .map((_, index) => ({ key: index, label: weekDaysMap[(index + 1) % 7].firstLetter }))
  }, []);
  const fakeDays = useMemo(() => {
    const firstDay = period.startDate.getDay();
    
    return new Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
  }, [period]);
  const days = useMemo(() => {
    const year = period ? period.startDate.getFullYear() : 2025;

    return new Array(((year % 4 === 0 && year % 100 > 0) || year % 400 == 0) ? 366 : 365)
      .fill(null)
      .map((_, index) => {
        const day = new Date(year, 0, 1);
        day.setDate(1 + index);

        return {
          index,
          day: new Intl.DateTimeFormat('fr', { weekday: 'short', day: 'numeric', month: 'long' }).format(day),
        };
      });
  }, [period]);

  return (
    <div className={`w-full grid grid-cols-28 gap-1 ${exported ? 'dark' : ''}`}>
      {headers.map(({ key, label }) => (
        <div className="flex justify-center" key={key}>
          <span className="text-xs text-black dark:text-white">{label}</span>
        </div>
      ))}
      {fakeDays.map((_, index) => <div key={index} />)}
      {days.map(({ index, day }) => {
        if (!values) return (
          <div className="animate-pulse aspect-square rounded-sm bg-black/50 dark:bg-white/70" key={index} />
        );

        const distance = values.distancesByDays[index] || 0;
        const active = distance > 0;
        const isInMaxActiveDaysInARow =
          index >= values.maxActiveDaysInARowStartIndex &&
          index < values.maxActiveDaysInARowStartIndex + values.maxActiveDaysInARow;

        return (
          <Tooltip
            key={index}
            label={exported ? '' : <>{day}{active && <><br />{formatDistance(distance)} kms</>}</>}
            position="bottom"
          >
            <div
              className={`aspect-square rounded-sm ${active ? (isInMaxActiveDaysInARow ? 'bg-emerald-300' : `bg-black/50 dark:bg-white/70`) : `border-1 border-black/50 dark:border-white/70`}`}
            />
          </Tooltip>
        );
      })}
    </div>
  );
}
