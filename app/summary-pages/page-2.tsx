import { Fragment, Ref, useMemo } from 'react';

import { months, statsMap, TValues } from '../dashboard/stats/types';
import { formatNumber } from '../utils/stats';

import SummaryPageContainer from './container';

export type TMonth = (typeof months)[number];

export const monthsMap: { [key in TMonth]: { label: string } } = {
  0: { label: 'janvier' },
  1: { label: 'février' },
  2: { label: 'mars' },
  3: { label: 'avril' },
  4: { label: 'mai' },
  5: { label: 'juin' },
  6: { label: 'juillet' },
  7: { label: 'août' },
  8: { label: 'septembre' },
  9: { label: 'octobre' },
  10: { label: 'novembre' },
  11: { label: 'décembre' },
}

const {
  distance: {
    Icon: DistanceIcon,
    label: distanceLabel,
    unit: distanceUnit,
    format: formatDistance,
  },
} = statsMap;

export default function SummaryPage2(
  { ref, values }: { ref: Ref<HTMLDivElement>, values: TValues | undefined },
) {
  const bestMonthIndex = useMemo(
    () => {
      let bestMonthIndex: TMonth = 0;
      let bestMonthDistance = 0;
      if (values) {
        values.distancesByMonth.forEach((distance, index) => {
          if (distance > bestMonthDistance) {
            bestMonthIndex = index as TMonth;
            bestMonthDistance = distance;
          }
        });
      }

      return bestMonthIndex;
    },
    [values],
  );
  const bestMonthDistance = useMemo(
    () => values?.distancesByMonth[bestMonthIndex],
    [values, bestMonthIndex],
  );
  const dividersTopPercentages = useMemo(
    () => {
      if (!bestMonthDistance) return [];

      return new Array(Math.floor(bestMonthDistance / 500_000))
        .fill(null)
        .map((_, index) => (500_000 * (index + 1)) / bestMonthDistance);
    },
    [bestMonthDistance],
  )

  return (
    <SummaryPageContainer ref={ref}>
      <div className="w-full shrink-0 flex items-center gap-[50px]">
        <DistanceIcon
          className="text-white"
          height={150}
          width={150}
        />
        <div className="flex flex-col gap-[15px]">
          <span className="text-7xl font-extrabold">
            {values !== undefined ? (
              <>
                {formatDistance(values.distance)}
                <span className="text-5xl ml-[15px]">{distanceUnit} {distanceLabel}</span>
              </>
            ) : '-'}
          </span>
          <span className="text-4xl text-white/80">
            {bestMonthDistance !== undefined ?
              <>dont <span className="text-emerald-300 font-bold">{formatDistance(bestMonthDistance)} {distanceUnit}</span> en {monthsMap[bestMonthIndex].label}</> :
              '-'
            }
          </span>
        </div>
      </div>
      {values && bestMonthDistance !== undefined ? (
        <div className="w-full grow flex flex-col gap-[15px]">
          <div className="grid grid-cols-12 gap-[15px] pl-[150px] pr-[50px]">
            {months.map((index) => {
              if (index !== bestMonthIndex) return <div key={index} />;

              return (
                <div className="flex justify-center" key={index}>
                  <span className="text-3xl text-emerald-300 font-bold">
                    {monthsMap[bestMonthIndex].label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="grow flex flex-col relative">
            {dividersTopPercentages.map((percentage, index) => (
              <Fragment key={index}>
                <div
                  className="absolute left-0 z-1"
                  style={{ bottom: `calc(${percentage * 100}% + 5px)` }}
                >
                  <span className="text-xl/1 text-white/50">{formatNumber(500 * (index + 1))} kms</span>
                </div>
                <div
                  className="absolute left-0 right-0 border-t-2 border-white/20 z-1"
                  style={{ bottom: `${percentage * 100}%` }}
                />
              </Fragment>
            ))}
            <div className="grow grid grid-cols-12 gap-[15px] pl-[150px] pr-[50px] border-b-2 border-white/50">
              {months.map((index) => {
                const value = values.distancesByMonth[index];
                const isBestMonth = index === bestMonthIndex;

                return (
                  <div className="flex flex-col justify-end" key={index}>
                    <div
                      className={`${isBestMonth ? 'bg-emerald-300' : 'bg-white'} rounded-t-xl z-2`}
                      style={{ height: `${(value / bestMonthDistance) * 100}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="grow" />
      )}
    </SummaryPageContainer>
  );
}