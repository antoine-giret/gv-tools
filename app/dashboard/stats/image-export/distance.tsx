import { Ref, useMemo } from 'react';

import { Distance } from '../distance';
import { statsMap, TValues, weekDays, weekDaysMap } from '../types';
import { TPeriod } from '../../../utils/period';

import { Wrapper } from './wrapper';

const {
  distance: {
    Icon: DistanceIcon,
    label: distanceLabel,
    unit: distanceUnit,
    format: formatDistance,
  },
} = statsMap;

export function DistancePage(
  {
    ref,
    period,
    title,
    subtitle,
    values,
  }: {
      period: TPeriod;
      ref: Ref<HTMLDivElement>;
      subtitle: string;
      title: string;
      values: TValues;
    },
) {
  const bestPeriod = useMemo(
    () => {
      let bestIndex = 0;
      let bestDistance = 0;

      if (period.type === 'week') {
        weekDays.forEach((index) => {
          const distance = values.distancesByWeekDays[index];
          if (distance > bestDistance) {
            bestIndex = index;
            bestDistance = distance;
          }
        });

        return {
          label: weekDaysMap[bestIndex].label,
          distance: bestDistance,
        };
      }
      
      if (period.type === 'month') {
        values.distancesByDays.forEach((distance, index) => {
          if (distance > bestDistance) {
            bestIndex = index;
            bestDistance = distance;
          }
        });

        return {
          label:
            `le ${new Intl.DateTimeFormat('fr', { day: 'numeric', month: 'long' }).format(new Date(period.startDate.getFullYear(), period.startDate.getMonth(), bestIndex + 1))}`,
          distance: bestDistance,
        };
      }

      values.distancesByMonth.forEach((distance, index) => {
        if (distance > bestDistance) {
          bestIndex = index;
          bestDistance = distance;
        }
      });

      return {
        label:
          `en ${new Intl.DateTimeFormat('fr', { month: 'long' }).format(new Date(period.startDate.getFullYear(), bestIndex, 1))}`,
        distance: bestDistance,
      };
    },
    [period, values],
  );

  return (
    <Wrapper ref={ref} subtitle={subtitle} title={title}>
      <div className="w-full shrink-0 flex items-center gap-[50px]">
        <DistanceIcon
          className="text-white"
          height={150}
          width={150}
        />
        <div className="flex flex-col gap-[15px]">
          <span className="text-7xl font-extrabold text-white">
            {formatDistance(values.distance)}
            <span className="text-5xl ml-[15px]">{distanceUnit} {distanceLabel}</span>
          </span>
          <span className="text-4xl text-white/80">
            dont <span className="text-emerald-300 font-bold">{formatDistance(bestPeriod.distance)} {distanceUnit}</span> {bestPeriod.label}
          </span>
        </div>
      </div>
      <div className="w-full grow flex items-center">
        <Distance download period={period} values={values} />
      </div>
    </Wrapper>
  );
}