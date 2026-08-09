'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { TPeriodType } from '@repo/models';
import { LngLatBounds } from 'maplibre-gl';
import { ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Button, PeriodSelector } from '../../components';
import { EmptyState } from '../../components/empty-state';
import { UserContext } from '../../context';
import PrivatePage from '../../guards/private';
import { useStats } from '../../hooks/queries/use-stats';
import { useTraces } from '../../hooks/queries/use-traces';
import { getH3FeatureCollection } from '../../utils/h3';
import { getInitialPeriod } from '../../utils/period';
import { useExport } from '../stats/hooks/export';
import { statsMap } from '../stats/types';

import { HeatmapExport } from './export';
import { Map, TMapRef } from './map';
import { layers, TLayer } from './types';

const { format: formatDistance } = statsMap.distance;

export default function HeatmapPage() {
  const [initialPeriodType] = useState<TPeriodType>('month');
  const [period, setPeriod] = useState(getInitialPeriod(initialPeriodType));
  const [selectedLayers, selectLayers] = useState<TLayer[]>(['traces']);
  const [downloading, setDownloading] = useState(false);
  const [mapToDownloadBounds, seMapToDownloadBounds] = useState<LngLatBounds | undefined>();
  const [mapReady, setMapReady] = useState(false);
  const { signedInUser } = useContext(UserContext);
  const { subtitle: exportTitle, setExportRef } = useExport({
    ready: mapReady,
    title: 'heatmap',
    period,
    setDownloading,
  });
  const mapRef = useRef<TMapRef>(null);

  useEffect(() => {
    return () => setMapReady(false);
  }, [downloading]);

  const { data: stats } = useStats({ user: signedInUser, period });
  const { data: tracesCollection, isFetching } = useTraces({ user: signedInUser, period });
  const isEmpty = useMemo(
    () => tracesCollection && tracesCollection.features.length === 0,
    [tracesCollection],
  );
  const h3Collection = useMemo<GeoJSON.FeatureCollection<GeoJSON.Polygon>>(
    () =>
      tracesCollection
        ? getH3FeatureCollection({ collection: tracesCollection })
        : { type: 'FeatureCollection', features: [] },
    [tracesCollection],
  );
  const layersLabels = useMemo<{ [key in TLayer]: string }>(
    () => ({
      tiles: `Tuiles H3${h3Collection.features.length > 0 ? ` (${h3Collection.features.length})` : ''}`,
      traces: 'Traces',
    }),
    [h3Collection],
  );
  const exportSubtitle = useMemo(() => {
    if (!stats) return '';

    const parts = [`${formatDistance(stats.distance)} kms à vélo`];
    if (selectedLayers.includes('tiles') && h3Collection.features.length > 0)
      parts.push(`${h3Collection.features.length} tuiles explorées`);

    return parts.join(' - ');
  }, [selectedLayers, stats, h3Collection]);

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
                    disabled={isFetching || isEmpty || selectedLayers.length === 0 || downloading}
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
              h3Collection={h3Collection}
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
          h3Collection={h3Collection}
          initialBounds={mapToDownloadBounds}
          mapId="exported-heatmap"
          ref={setExportRef}
          selectedLayers={selectedLayers}
          setReady={setMapReady}
          subtitle={exportSubtitle}
          subtitleClassName="normal-case"
          title={exportTitle}
          titleClassName="capitalize"
          tracesCollection={tracesCollection}
        />
      )}
    </>
  );
}
