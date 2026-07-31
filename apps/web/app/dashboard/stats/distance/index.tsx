import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { TPeriod } from '@repo/models';
import { useEffect, useState } from 'react';

import { Button } from '../../../components';
import { useExport } from '../hooks/export';
import { TValues } from '../types';

import { DistanceChart } from './chart';
import { DistanceExport } from './export';
import { DistanceHeader } from './header';

export function Distance({
  exported,
  period,
  values,
}: {
  exported?: boolean;
  period: TPeriod;
  values: TValues | undefined;
}) {
  const [downloading, setDownloading] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const {
    title: exportTitle,
    subtitle: exportSubtitle,
    setExportRef,
  } = useExport({ ready: chartReady, title: 'distance', period, setDownloading });

  useEffect(() => {
    return () => setChartReady(false);
  }, [downloading]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex gap-6 items-center justify-between">
          <DistanceHeader period={period} values={values} />
          <Button
            disabled={!values || downloading}
            Icon={ArrowDownTrayIcon}
            label="Télécharger"
            onClick={() => setDownloading(true)}
            variant="outlined"
          />
        </div>
        <DistanceChart exported={exported} period={period} values={values} />
      </div>
      {values && downloading && (
        <DistanceExport
          period={period}
          ref={setExportRef}
          setReady={setChartReady}
          subtitle={exportSubtitle}
          title={exportTitle}
          values={values}
        />
      )}
    </>
  );
}
