import { useTheme } from 'next-themes';
import { useMemo } from 'react';

import { Tooltip } from '../../components';
import { TPeriod } from '../../utils/period';

import { statsMap, TValues, weekDaysMap } from './types';

const { distance: { format: formatDistance } } = statsMap;

export function Calendar({
  download,
  period,
  values,
}: {
  download?: boolean;
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
  const { theme } = useTheme();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-md font-bold">Calendrier des jours roulés</h2>
      <div className="w-full grid grid-cols-28 gap-1">
        {headers.map(({ key, label }) => (
          <div className="flex justify-center" key={key}>
            <span className={`text-xs ${download ? 'text-white' : 'text-black dark:text-white'}`}>{label}</span>
          </div>
        ))}
        {fakeDays.map((_, index) => <div key={index} />)}
        {days.map(({ index, day }) => {
          if (!values) return (
            <div className="animate-pulse aspect-square rounded-sm bg-black/30 dark:bg-white/30" key={index} />
          );

          const distance = values.distancesByDays[index] || 0;
          const active = distance > 0;
          const isInMaxActiveDaysInARow =
            index >= values.maxActiveDaysInARowStartIndex &&
            index < values.maxActiveDaysInARowStartIndex + values.maxActiveDaysInARow;

          return (
            <Tooltip
              key={index}
              label={download ? '' : <>{day}{active && <><br />{formatDistance(distance)} kms</>}</>}
              position="bottom"
            >
              <div
                className={`aspect-square rounded-sm ${active ? (isInMaxActiveDaysInARow ? 'bg-emerald-300' : `${download ? 'bg-white' : 'bg-black/30 dark:bg-white/70'}`) : `border-1 ${download ? 'border-white' : 'border-black/30 dark:border-white/50'}`}`}
              />
            </Tooltip>
          );
        })}
      </div>
      {!download && (
        <div className="w-full flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div style={{ width: 'calc((100% - 27 * 4px) / 28)' }}>
              <div
                className="aspect-square rounded-sm"
                style={{
                  background: theme === 'light' ?
                    'linear-gradient(to top left, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3) 50%, var(--color-emerald-300) 50%, var(--color-emerald-300) 100%)' :
                    'linear-gradient(to top left, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7) 50%, var(--color-emerald-300) 50%, var(--color-emerald-300) 100%)',
                }}
              />
            </div>
            <span className="text-sm text-black dark:text-white">
              Jour avec activité
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ width: 'calc((100% - 27 * 4px) / 28)' }}>
              <div className="aspect-square rounded-sm border-1 border-black/30 dark:border-white/50" />
            </div>
            <span className="text-black dark:text-white">
              Jour sans activité
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
