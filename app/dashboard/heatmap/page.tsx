'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { useContext, useEffect, useState } from 'react';

import { Button, PeriodSelector } from '../../components';
import { UserContext } from '../../context';
import PrivatePage from '../../guards/private';
import { TUser } from '../../models/user';
import { getInitialPeriod, TPeriod, TPeriodType } from '../../utils/period';
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

    async function fetchTraces({
      user: { id: userId, authorizationToken },
      period: { startDate, endDate },
    }: {
      period: TPeriod;
      user: TUser;
    }) {
      const startDateFormatted = startDate.toISOString().split('T')[0].split('-').join('-');
      const endDateFormatted = endDate.toISOString().split('T')[0].split('-').join('-');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_GV_BACKEND_URL}/api/v2/users/${userId}/simplified_traces?date_start=${startDateFormatted}&date_end=${endDateFormatted}&unit=day`,
        {
          method: 'GET',
          headers: {
            'Api-Key': process.env.NEXT_PUBLIC_GV_API_KEY || '',
            source: process.env.NEXT_PUBLIC_GV_SOURCE || '',
            Authorization: `Token ${authorizationToken}`,
          },
        },
      );

      if (res.status !== 200) {
        console.error('cannot fetch stats');
        if (active) setTracesCollection({ type: 'FeatureCollection', features: [] });
        return;
      }

      const collection = (await res.json()) as GeoJSON.FeatureCollection<GeoJSON.LineString>;

      if (active)
        setTracesCollection(
          collection.features ? collection : { type: 'FeatureCollection', features: [] },
        );
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
