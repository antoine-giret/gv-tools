'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { TPeriodType } from '@repo/models';
import { LngLatBounds } from 'maplibre-gl';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Button, PeriodSelector } from '../../components';
import { EmptyState } from '../../components/empty-state';
import { UserContext } from '../../context';
import PrivatePage from '../../guards/private';
import { useTraces } from '../../hooks/queries/use-traces';
import { getInitialPeriod } from '../../utils/period';
import { useExport } from '../stats/hooks/export';

import { HeatmapExport } from './export';
import { Map, TMapRef } from './map';

export default function HeatmapPage() {
  const [initialPeriodType] = useState<TPeriodType>('month');
  const [period, setPeriod] = useState(getInitialPeriod(initialPeriodType));
  const [downloading, setDownloading] = useState(false);
  const [mapToDownloadBounds, seMapToDownloadBounds] = useState<LngLatBounds | undefined>();
  const [mapReady, setMapReady] = useState(false);
  const { signedInUser } = useContext(UserContext);
  const {
    title: exportTitle,
    subtitle: exportSubtitle,
    setExportRef,
  } = useExport({ ready: mapReady, title: 'heatmap', period, setDownloading });
  const mapRef = useRef<TMapRef>(null);

  useEffect(() => {
    return () => setMapReady(false);
  }, [downloading]);

  const { data: tracesCollection, isFetching } = useTraces({ user: signedInUser, period });
  const isEmpty = useMemo(
    () => tracesCollection && tracesCollection.features.length === 0,
    [tracesCollection],
  );

  return (
    <>
      <PrivatePage>
        <div
          className={`flex flex-col items-stretch ${isEmpty ? 'gap-12' : 'gap-6'} grow @container`}
        >
          <div className="flex flex-col gap-6 shrink-0">
            <h1 className="text-lg font-bold">Ma heatmap</h1>
            <div className="flex flex-col @2xl:flex-row gap-6 items-stretch @2xl:items-center justify-between">
              <PeriodSelector
                period={period}
                periodTypes={['month', 'year']}
                setPeriod={setPeriod}
              />
              {(!tracesCollection || !isEmpty) && (
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
                    onClick={() => {
                      seMapToDownloadBounds(mapRef.current?.getBounds());
                      setDownloading(true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          {isEmpty ? (
            <EmptyState period={period} />
          ) : (
            <Map mapId="heatmap" ref={mapRef} tracesCollection={tracesCollection} />
          )}
        </div>
      </PrivatePage>
      {tracesCollection && downloading && (
        <HeatmapExport
          initialBounds={mapToDownloadBounds}
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
