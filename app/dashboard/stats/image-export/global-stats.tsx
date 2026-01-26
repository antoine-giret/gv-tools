import { Ref } from 'react';
import { stats, statsMap, TValues } from '../types';

import { Wrapper } from './wrapper';

export function GlobalStatsPage(
  {
    ref,
    title,
    subtitle,
    values,
  }: {
    ref: Ref<HTMLDivElement>;
    subtitle: string;
    title: string;
    values: TValues;
  },
) {
  return (
    <Wrapper ref={ref} subtitle={subtitle} title={title}>
      <div className="w-full grid grid-cols-2 gap-[100px]">
        {stats.map((key) => {
          const { Icon, label, unit, format } = statsMap[key];
          const value = values[key];

          return (
            <div className="flex flex-col items-center gap-[40px]" key={key}>
              <Icon className="text-emerald-300" height={150} width={150} />
              <div className="flex flex-col items-center gap-[15px]">
                <span className="text-7xl font-extrabold  text-white">
                  {format(value)}
                  <span className="text-5xl ml-[15px]">{unit}</span>
                </span>
                <span className="text-4xl text-white/80">{label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Wrapper>
  );
}