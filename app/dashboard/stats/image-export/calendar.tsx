import { Ref } from 'react';
import { statsMap, TValues } from '../types';
import { TPeriod } from '../../../utils/period';

import { Wrapper } from './wrapper';
import { Calendar } from '../calendar';
import { Days } from '../days';

const {
  activeDays: {
    Icon: ActiveDaysIcon,
    label: activeDaysLabel,
    unit: activeDaysUnit,
    format: formatActiveDays,
  },
} = statsMap;

export function CalendarPage(
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
  return (
    <Wrapper ref={ref} subtitle={subtitle} title={title}>
      <div className="w-full shrink-0 flex items-center gap-[50px]">
        <ActiveDaysIcon
          className="text-white"
          height={150}
          width={150}
        />
        <div className="flex flex-col gap-[15px]">
          <span className="text-7xl font-extrabold text-white">
            {formatActiveDays(values.activeDays)}
            <span className="text-5xl ml-[15px]">{activeDaysUnit} {activeDaysLabel}</span>
          </span>
          <span className="text-4xl text-white/80">
            dont <span className="text-emerald-300 font-bold">{values.maxActiveDaysInARow}</span> à la suite
          </span>
        </div>
      </div>
      <div className="w-full grow flex flex-col gap-[50px]">
        <Calendar download period={period} values={values} />
        <Days download values={values} />
      </div>
    </Wrapper>
  );
}