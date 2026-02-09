'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { TPeriod, TPeriodType, TUser } from '@repo/models';
import { TraceService } from '@repo/services';
import { useContext, useEffect, useState } from 'react';

import { Button, PeriodSelector } from '../../components';
import { UserContext } from '../../context';
import PrivatePage from '../../guards/private';
import { getInitialPeriod } from '../../utils/period';
import { useExport } from '../stats/hooks/export';

import { HeatmapExport } from './export';
import { Map } from './map';

export default function HeatmapPage() {
  const [initialPeriodType] = useState<TPeriodType>('month');
  const [period, setPeriod] = useState(getInitialPeriod(initialPeriodType));
  const [tracesCollection, setTracesCollection] =
    useState<GeoJSON.FeatureCollection<GeoJSON.LineString>>();
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

  useEffect(() => {
    let active = true;

    async function fetchTraces({ user: { id: userId }, period }: { period: TPeriod; user: TUser }) {
      try {
        const collection = await TraceService.fetchTraces<
          GeoJSON.FeatureCollection<GeoJSON.LineString>
        >({ userId, period });
        if (active) {
          setTracesCollection(
            collection.features ? collection : { type: 'FeatureCollection', features: [] },
          );
        }
      } catch (err) {
        console.error('cannot fetch stats', err);
        if (active) setTracesCollection({ type: 'FeatureCollection', features: [] });
      }
    }

    if (signedInUser) fetchTraces({ user: signedInUser, period });

    return () => {
      active = false;
      setTracesCollection(undefined);
    };
  }, [signedInUser, period]);

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
                  disabled={!tracesCollection || downloading}
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
