import { Ref, useMemo } from 'react';

import { statsMap, TValues, weekDays } from '../dashboard/stats/types';

import SummaryPageContainer from './container';

const {
  activeDays: {
    Icon: ActiveDaysIcon,
    label: activeDaysLabel,
    unit: activeDaysUnit,
    format: formatActiveDays,
  },
} = statsMap;

export default function SummaryPage3(
  { ref, year, values }: { ref: Ref<HTMLDivElement>; values: TValues | undefined; year: number },
) {
  const headers = useMemo(() => {
    return new Array(28)
      .fill(null)
      .map((_, index) => ({ key: index, label: weekDays[index % 7].shortLabel }))
  }, []);
  const days = useMemo(() => {
    return new Array(((year % 4 === 0 && year % 100 > 0) || year % 400 == 0) ? 366 : 365)
      .fill(null)
      .map((_, index) => index);
  }, [year]);
  const fakeDays = useMemo(() => {
    const firstDay = new Date(year, 0, 1).getDay();
    
    return new Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
  }, [year]);
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
    <SummaryPageContainer ref={ref}>
      <div className="w-full shrink-0 flex items-center gap-[50px]">
        <ActiveDaysIcon
          className="text-white"
          height={150}
          width={150}
        />
        <div className="flex flex-col gap-[15px]">
          <span className="text-7xl font-extrabold">
            {values !== undefined ? (
              <>
                {formatActiveDays(values.activeDays)}
                <span className="text-5xl ml-[15px]">{activeDaysUnit} {activeDaysLabel}</span>
              </>
            ) : '-'}
          </span>
          <span className="text-4xl text-white/80">
            {values ? <>dont <span className="text-emerald-300 font-bold">{values.maxActiveDaysInARow}</span> à la suite</> : '-'}
          </span>
        </div>
      </div>
      {values && bestWeekDayDistance !== undefined ? (
        <>
          <div className="w-full grid grid-cols-28 gap-[6px]">
            {headers.map(({ key, label }) => (
              <div className="flex justify-center" key={key}>
                <span className="text-xl text-white/50">{label}</span>
              </div>
            ))}
            {fakeDays.map((_, index) => <div key={index} />)}
            {days.map((index) => {
              const active = values.distancesByDays[index] && values.distancesByDays[index] > 0;
              const isInMaxActiveDaysInARow =
                index >= values.maxActiveDaysInARowStartIndex &&
                index < values.maxActiveDaysInARowStartIndex + values.maxActiveDaysInARow;

              return (
                <div
                  className={`aspect-square rounded-sm ${active ? (isInMaxActiveDaysInARow ? 'bg-emerald-300' : 'bg-white') : 'border-2 border-white/50'}`}
                  key={index}
                />
              );
            })}
          </div>
          <div className="w-full grid grid-cols-7 gap-[50px]">
            {weekDays.map(({ key, label }) => {
              const isBestWeekDay = key === bestWeekDayIndex;
              const percentage = (values.distancesByWeekDays[key] / bestWeekDayDistance) * 100;

              return (
                <div className="flex flex-col items-center gap-[15px]" key={key}>
                  <span
                    className={`text-3xl ${isBestWeekDay ? 'text-emerald-300 font-bold' : 'text-white'}`}
                  >
                    {label}
                  </span>
                  <div className="w-full aspect-square flex items-center justify-center">
                    <div
                      className={`rounded-full ${isBestWeekDay ? 'bg-emerald-300' : 'bg-white'}`}
                      style={{ height: `${percentage}%`, width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grow" />
      )}
    </SummaryPageContainer>
  );
}