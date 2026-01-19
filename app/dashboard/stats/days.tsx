import { useMemo } from 'react';

import { Skeleton, Tooltip } from '../../components';
import { formatNumber } from '../../utils/stats';

import { TValues, weekDays, weekDaysMap } from './types';

export function Days({ values }: { values: TValues | undefined }) {
  const bestWeekDayIndex = useMemo(
    () => {
      let bestWeekDayIndex = 0;
      let bestWeekDayDistance = 0;
      if (values) {
        values.distancesByWeekDays.forEach((distance, index) => {
          if (distance > bestWeekDayDistance) {
            bestWeekDayIndex = index;
            bestWeekDayDistance = distance;
          }
        });
      }

      return bestWeekDayIndex;
    },
    [values],
  );
  const bestWeekDayDistance = useMemo(
    () => values?.distancesByWeekDays[bestWeekDayIndex],
    [values, bestWeekDayIndex],
  );

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-md font-bold">Jours préférés pour pédaler</h2>
      <div className="w-full grid grid-cols-7 gap-6">
        {weekDays.map((index) => {
          const { label } = weekDaysMap[index];
          const isBestWeekDay = index === bestWeekDayIndex;
          const value = values ? values.distancesByWeekDays[index] : undefined;
          const percentage =
            value !== undefined && bestWeekDayDistance != undefined ?
              (value / bestWeekDayDistance) * 100 :
              undefined;

          return (
            <div className="flex flex-col items-center gap-2" key={index}>
              <span
                className={`text-md ${isBestWeekDay ? 'text-emerald-300 font-bold' : ''} capitalize`}
              >
                {label}
              </span>
              <div className="w-full max-w-12 aspect-square flex items-center justify-center">
                {percentage !== undefined ? (
                  <Tooltip
                    label={value !== undefined ? `${formatNumber(Math.round(value / 100) / 10)} kms` : ''}
                    position="bottom"
                    style={{ height: `${percentage}%`, width: `${percentage}%` }}
                  >
                    <div
                      className={`w-full h-full rounded-full ${isBestWeekDay ? 'bg-emerald-300' : 'bg-black/30 dark:bg-white/50'}`}
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
