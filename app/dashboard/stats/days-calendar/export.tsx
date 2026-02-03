import { Ref } from 'react';

import { TPeriod } from '../../../utils/period';
import { Days } from '../days';
import { ExportLayout } from '../layouts/export';
import { statsMap, TValues } from '../types';

import { Calendar } from './calendar';

const {
  activeDays: {
    Icon: ActiveDaysIcon,
    label: activeDaysLabel,
    unit: activeDaysUnit,
    format: formatActiveDays,
  },
} = statsMap;

export function CalendarExport({
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
}) {
  return (
    <ExportLayout ref={ref} subtitle={subtitle} title={title}>
      <div className="w-full shrink-0 flex items-center gap-[50px]">
        <ActiveDaysIcon className="text-white" height={150} width={150} />
        <div className="flex flex-col gap-[15px]">
          <span className="text-7xl font-extrabold text-white">
            {formatActiveDays(values.activeDays)}
            <span className="text-5xl ml-[15px]">
              {activeDaysUnit} {activeDaysLabel}
            </span>
          </span>
          <span className="text-4xl text-white/80">
            dont <span className="text-emerald-300 font-bold">{values.maxActiveDaysInARow}</span> à
            la suite
          </span>
        </div>
      </div>
      <div className="w-full grow flex flex-col gap-[50px]">
        <div className="flex flex-col gap-6">
          <h2 className="text-md font-bold text-white">Calendrier des jours roulés</h2>
          <Calendar exported period={period} values={values} />
        </div>
        <Days exported values={values} />
      </div>
    </ExportLayout>
  );
}
