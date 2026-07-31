import { useMemo } from 'react';

import { Skeleton, Tooltip } from '../../components';

import { statsMap, TValues, weekDays, weekDaysMap } from './types';

const { format: formatDistance } = statsMap.distance;

export function Days({ exported, values }: { exported?: boolean; values: TValues | undefined }) {
  const bestWeekDayIndex = useMemo(() => {
    let bestWeekDayIndex = 0;
    let bestWeekDayDistance = 0;
    if (values) {
      weekDays.forEach((index) => {
        const distance = values.distancesByWeekDays[index];
        if (distance > bestWeekDayDistance) {
          bestWeekDayIndex = index;
          bestWeekDayDistance = distance;
        }
      });
    }

    return bestWeekDayIndex;
  }, [values]);
  const bestWeekDayDistance = useMemo(
    () => values?.distancesByWeekDays[bestWeekDayIndex],
    [values, bestWeekDayIndex],
  );

  return (
    <div className={`flex flex-col ${exported ? 'dark gap-[50px]' : 'gap-6'}`}>
      <div className={`flex flex-col ${exported ? 'dark gap-[10px]' : 'gap-1'}`}>
        <h2 className={`${exported ? 'text-3xl' : 'text-md'} font-bold text-black dark:text-white`}>
          Jour préféré pour pédaler
        </h2>
        {!exported && bestWeekDayDistance === undefined ? (
          <Skeleton size="sm" variant="text" width="w-[200px]" />
        ) : (
          bestWeekDayDistance && (
            <p className={`${exported ? 'text-2xl' : 'text-sm'} text-black dark:text-white`}>
              <span className="text-emerald-500 dark:text-emerald-300">
                {formatDistance(bestWeekDayDistance)} kms
              </span>{' '}
              le {weekDaysMap[bestWeekDayIndex].label}
            </p>
          )
        )}
      </div>
      <div className="w-full grid grid-cols-7 gap-6">
        {weekDays.map((index) => {
          const { shortLabel } = weekDaysMap[index];
          const isBestWeekDay = index === bestWeekDayIndex;
          const value = values ? values.distancesByWeekDays[index] || 0 : undefined;
          const percentage =
            value !== undefined && bestWeekDayDistance != undefined
              ? (value / bestWeekDayDistance) * 100
              : undefined;

          return (
            <div className="flex flex-col items-center gap-2" key={index}>
              <span
                className={`text-md ${isBestWeekDay ? 'text-emerald-300 font-bold' : 'text-black dark:text-white'} capitalize`}
              >
                {shortLabel}
              </span>
              <div className="w-full max-w-12 aspect-square flex items-center justify-center">
                {percentage !== undefined ? (
                  <Tooltip
                    label={!exported && value !== undefined ? `${formatDistance(value)} kms` : ''}
                    position="bottom"
                    style={{
                      height: `${percentage}%`,
                      width: `${percentage}%`,
                      minHeight: 4,
                      minWidth: 4,
                    }}
                  >
                    <div
                      className={`w-full h-full rounded-full ${isBestWeekDay ? 'bg-emerald-300' : 'bg-black/30 dark:bg-white/70'}`}
                    />
                  </Tooltip>
                ) : (
                  <Skeleton height="h-[50%]" variant="circular" width="w-[50%]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
