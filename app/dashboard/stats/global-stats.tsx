import { Skeleton } from '../../components';

import { stats, statsMap, TValues } from './types';

export function GlobalStats({ values }: { values: TValues | undefined }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((key) => {
        const { Icon, label, unit, format } = statsMap[key];
        const value = values?.[key];

        return (
          <div
            className="flex flex-col items-center gap-3 p-3 border border-black/20 dark:border-white/20 rounded-md"
            key={key}
          >
            <Icon className="size-8 text-emerald-500 dark:text-emerald-300" />
            <div className="w-full flex flex-col items-center">
              {value !== undefined ? (
                <span className="text-lg font-bold text-center">{format(value)}</span>
              ) : (
                <Skeleton />
              )}
              <span className="text-sm text-center text-black/70 dark:text-white/70">
                {unit}&nbsp;{label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
