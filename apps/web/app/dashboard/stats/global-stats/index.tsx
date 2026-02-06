import { Card, Skeleton } from '../../../components';
import { TPeriod } from '../../../utils/period';
import { useExport } from '../hooks/export';
import { stats, statsMap, TValues } from '../types';

import { GlobalStatsExport } from './export';

export function GlobalStats({
  period,
  values,
  downloading,
  setDownloading,
}: {
  downloading: boolean;
  period: TPeriod;
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

          return (
            <Card key={key}>
              <div className="flex flex-col items-center gap-3 p-3">
                <Icon className="size-8 text-emerald-500 dark:text-emerald-300" />
                <div className="w-full flex flex-col items-center">
                  {value !== undefined ? (
                    <span className="text-lg font-bold text-center">{format(value)}</span>
                  ) : (
                    <Skeleton align="center" size="lg" variant="text" width="w-[50%]" />
                  )}
                  <span className="text-sm text-center text-black/70 dark:text-white/70">
                    {unit}&nbsp;{label}
                  </span>
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
