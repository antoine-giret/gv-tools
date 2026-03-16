'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { TPeriodType } from '@repo/models';
import { useContext, useEffect, useState } from 'react';

import { Button, PeriodSelector } from '../../components';
import { UserContext } from '../../context';
import PrivatePage from '../../guards/private';
import { useTraces } from '../../hooks/queries/use-traces';
import { getInitialPeriod } from '../../utils/period';
import { useExport } from '../stats/hooks/export';

import { HeatmapExport } from './export';
import { Map } from './map';

export default function HeatmapPage() {
  const [initialPeriodType] = useState<TPeriodType>('month');
  const [period, setPeriod] = useState(getInitialPeriod(initialPeriodType));
  const [downloading, setDownloading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const { signedInUser } = useContext(UserContext);
  const {
    title: exportTitle,
    subtitle: exportSubtitle,
    setExportRef,
  } = useExport({ ready: mapReady, title: 'heatmap', period, setDownloading });

  useEffect(() => {
    return () => setMapReady(false);
  }, [downloading]);

  const { data: tracesCollection, isFetching } = useTraces({ user: signedInUser, period });

  return (
    <>
      <PrivatePage>
        <div className="flex flex-col items-stretch gap-6 grow">
          <div className="flex flex-col gap-6 shrink-0">
            <h1 className="text-lg font-bold">Ma heatmap</h1>
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-6 items-stretch sm:items-center md:items-stretch lg:items-center justify-between">
              <PeriodSelector
                period={period}
                periodTypes={['month', 'year']}
                setPeriod={setPeriod}
              />
              <div className="flex justify-end">
                <Button
                  disabled={
                    isFetching ||
                    !tracesCollection ||
                    tracesCollection.features.length === 0 ||
                    downloading
                  }
                  Icon={ArrowDownTrayIcon}
                  label="Télécharger"
                  onClick={() => setDownloading(true)}
                />
              </div>
            </div>
          </div>
          <Map mapId="heatmap" tracesCollection={tracesCollection} />
        </div>
      </PrivatePage>
      {tracesCollection && downloading && (
        <HeatmapExport
          mapId="exported-heatmap"
          ref={setExportRef}
          setReady={setMapReady}
          subtitle={exportSubtitle}
          title={exportTitle}
          tracesCollection={tracesCollection}
        />
      )}
    </>
  );
}
