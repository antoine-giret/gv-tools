import { TPeriod } from '@repo/models';

import { Card, Skeleton } from '../../../components';
import { TrendingDownIcon, TrendingUpIcon } from '../../../components/icons';
import { useExport } from '../hooks/export';
import { stats, statsMap, TValues } from '../types';

import { GlobalStatsExport } from './export';

export function GlobalStats({
  period,
  values,
  prevValues,
  downloading,
  setDownloading,
}: {
  downloading: boolean;
  period: TPeriod;
  prevValues: TValues | undefined;
  setDownloading: (downloading: boolean) => void;
  values: TValues | undefined;
}) {
  const {
    title: exportTitle,
    subtitle: exportSubtitle,
    setExportRef,
  } = useExport({ ready: true, period, setDownloading });

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((key) => {
          const { Icon, label, unit, format } = statsMap[key];
          const value = values?.[key];
          const prevValue = prevValues?.[key];
          const diff =
            value === undefined || prevValue === undefined ? undefined : value - prevValue;

          return (
            <Card key={key}>
              <div className="flex flex-col items-center gap-3 p-3">
                <Icon className="size-8 text-emerald-500 dark:text-emerald-300" />
                <div className="w-full flex flex-col items-stretch gap-2 overflow-hidden">
                  <div className="flex flex-col items-center">
                    {value !== undefined ? (
                      <span className="text-xl font-bold text-center">{format(value)}</span>
                    ) : (
                      <Skeleton align="center" size="xl" variant="text" width="w-[50%]" />
                    )}
                    <span className="max-w-full text-sm text-center truncate text-black/70 dark:text-white/70">
                      {unit}&nbsp;{label}
                    </span>
                  </div>
                  {diff !== undefined ? (
                    diff !== 0 && (
                      <div
                        className={`h-6 flex items-center justify-center gap-2 text-sm text-center ${diff < 0 ? 'text-red-500 dark:text-red-300' : 'text-emerald-500 dark:text-emerald-300'}`}
                      >
                        {diff < 0 ? (
                          <TrendingDownIcon className="size-4 shrink-0" />
                        ) : (
                          <TrendingUpIcon className="size-4 shrink-0" />
                        )}
                        <span className="truncate">
                          {diff < 0 ? '-' : '+'}
                          {format(Math.abs(diff))} {unit}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center">
                      <Skeleton height="h-6" variant="rounded" width="w-[50%]" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {values && downloading && (
        <GlobalStatsExport
          ref={setExportRef}
          subtitle={exportSubtitle}
          title={exportTitle}
          values={values}
        />
      )}
    </>
  );
}
