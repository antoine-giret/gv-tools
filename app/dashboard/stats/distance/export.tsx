import { Ref, useMemo } from 'react';

import { TPeriod } from '../../../utils/period';
import { Days } from '../days';
import { ExportLayout } from '../layouts/export';
import { statsMap, TValues, weekDays, weekDaysMap } from '../types';

import { DistanceChart } from './chart';

const {
  distance: {
    Icon: DistanceIcon,
    label: distanceLabel,
    unit: distanceUnit,
    format: formatDistance,
  },
} = statsMap;

export function DistanceExport(
  {
    ref,
    period,
    title,
    subtitle,
    values,
    setReady,
  }: {
    period: TPeriod;
    ref: Ref<HTMLDivElement>;
    subtitle: string;
    title: string;
    setReady?: (ready: boolean) => void;
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
    <ExportLayout ref={ref} subtitle={subtitle} title={title}>
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
      {period.type === 'month' && (
        <div className="w-full grow flex flex-col gap-[50px]">
          <div className="flex flex-col gap-6">
            <h2 className="text-md font-bold text-white">
              Distance parcourue par jour
            </h2>
            <DistanceChart exported period={period} setReady={setReady} values={values} />
          </div>
          {<Days exported values={values} />}
        </div>
      )}
    </ExportLayout>
  );
}