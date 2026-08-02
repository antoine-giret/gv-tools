'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { TPeriodType } from '@repo/models';
import { LngLatBounds } from 'maplibre-gl';
import { ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Button, PeriodSelector } from '../../components';
import { EmptyState } from '../../components/empty-state';
import { UserContext } from '../../context';
import PrivatePage from '../../guards/private';
import { useTraces } from '../../hooks/queries/use-traces';
import { getInitialPeriod } from '../../utils/period';
import { useExport } from '../stats/hooks/export';

import { HeatmapExport } from './export';
import { Map, TMapRef } from './map';
import { layers, TLayer } from './types';

const layersLabels: { [key in TLayer]: string } = { tiles: 'Tuiles H3', traces: 'Traces' };

export default function HeatmapPage() {
  const [initialPeriodType] = useState<TPeriodType>('month');
  const [period, setPeriod] = useState(getInitialPeriod(initialPeriodType));
  const [selectedLayers, selectLayers] = useState<TLayer[]>(['traces']);
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

  function handleChangeLayer({ currentTarget: { value, checked } }: ChangeEvent<HTMLInputElement>) {
    const layer = value as TLayer;

    if (checked && !selectedLayers.includes(layer)) selectLayers([...selectedLayers, layer]);
    else if (!checked) selectLayers(selectedLayers.filter((key) => key !== layer));
  }

  return (
    <>
      <PrivatePage>
        <div
          className={`flex flex-col items-stretch ${isEmpty ? 'gap-12' : 'gap-6'} grow @container`}
        >
          <div className="flex flex-col gap-6 shrink-0">
            <h1 className="text-lg font-bold">Ma heatmap</h1>
            <PeriodSelector period={period} periodTypes={['month', 'year']} setPeriod={setPeriod} />
            {(!tracesCollection || !isEmpty) && (
              <div className="flex flex-col @sm:flex-row @sm:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {layers.map((key) => {
                    const active = selectedLayers.includes(key);

                    return (
                      <label className="flex items-center gap-2" key={key}>
                        <input
                          checked={active}
                          className={`shrink-0 w-3 h-3 border ${active ? 'bg-emerald-300 border-emerald-500 ring ring-emerald-500' : 'bg-black/10 dark:bg-white/10 border-black/50 dark:border-white/50'} outline-none rounded-xs appearance-none`}
                          disabled={
                            isFetching ||
                            !tracesCollection ||
                            tracesCollection.features.length === 0 ||
                            downloading
                          }
                          onChange={handleChangeLayer}
                          type="checkbox"
                          value={key}
                        />
                        <span>{layersLabels[key]}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="self-end">
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
              </div>
            )}
          </div>
          {isEmpty ? (
            <EmptyState period={period} />
          ) : (
            <Map
              mapId="heatmap"
              ref={mapRef}
              selectedLayers={selectedLayers}
              tracesCollection={tracesCollection}
            />
          )}
        </div>
      </PrivatePage>
      {tracesCollection && downloading && (
        <HeatmapExport
          initialBounds={mapToDownloadBounds}
          mapId="exported-heatmap"
          ref={setExportRef}
          selectedLayers={selectedLayers}
          setReady={setMapReady}
          subtitle={exportSubtitle}
          title={exportTitle}
          tracesCollection={tracesCollection}
        />
      )}
    </>
  );
}
