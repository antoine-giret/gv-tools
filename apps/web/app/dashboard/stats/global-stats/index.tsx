import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';
import { TPeriod } from '@repo/models';

import { Skeleton, StatCard } from '../../../components';
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
  prevValues: TValues | null | undefined;
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
      <div className="grid grid-cols-2 @2xl:grid-cols-4 gap-6">
        {stats.map((key) => {
          const { Icon, label, unit, format } = statsMap[key];
          const value = values?.[key];
          const prevValue = prevValues !== null ? prevValues?.[key] : null;
          const diff =
            prevValue === null
              ? null
              : value === undefined || prevValue === undefined
                ? undefined
                : value - prevValue;

          return (
            <StatCard
              truncateLabel
              Icon={Icon}
              key={key}
              label={
                <>
                  {unit}&nbsp;{label}
                </>
              }
              value={value !== undefined ? format(value) : undefined}
            >
              {diff !== null &&
                (diff !== undefined ? (
                  diff !== 0 && (
                    <div
                      className={`h-6 flex items-center justify-center gap-2 text-sm text-center ${diff < 0 ? 'text-red-500 dark:text-red-300' : 'text-emerald-500 dark:text-emerald-300'}`}
                    >
                      {diff < 0 ? (
                        <ArrowTrendingDownIcon className="size-4 shrink-0" />
                      ) : (
                        <ArrowTrendingUpIcon className="size-4 shrink-0" />
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
                ))}
            </StatCard>
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
