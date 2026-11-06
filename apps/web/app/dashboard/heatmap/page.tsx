'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { LngLatBounds } from 'maplibre-gl';
import { ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Button, PeriodSelector } from '../../components';
import { EmptyState } from '../../components/empty-state';
import { UserContext } from '../../context';
import PrivatePage from '../../guards/private';
import { useNewH3Cells } from '../../hooks/queries/use-new-h3-cells';
import { useStats } from '../../hooks/queries/use-stats';
import { useTraces } from '../../hooks/queries/use-traces';
import { getH3FeatureCollection } from '../../utils/h3';
import { getInitialPeriod } from '../../utils/period';
import { useExport } from '../stats/hooks/export';
import { statsMap } from '../stats/types';

import { HeatmapExport } from './export';
import { HeatmapStats } from './heatmap-stats';
import { Map, TMapRef } from './map';
import { TLayer } from './types';

const { format: formatDistance } = statsMap.distance;

export default function HeatmapPage() {
  const [period, setPeriod] = useState(getInitialPeriod('month'));
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
  const { data: newH3Indexes } = useNewH3Cells({ user: signedInUser, period });
  const { data: tracesCollection, isFetching } = useTraces({ user: signedInUser, period });
  const isEmpty = useMemo(
    () => tracesCollection && tracesCollection.features.length === 0,
    [tracesCollection],
  );
  const tracesH3Collection = useMemo<GeoJSON.FeatureCollection<GeoJSON.Polygon>>(
    () =>
      tracesCollection
        ? getH3FeatureCollection({ collection: tracesCollection })
        : { type: 'FeatureCollection', features: [] },
    [tracesCollection],
  );
  // Flagged apart so that the largest area is not computed again once the new tiles are known
  const h3Collection = useMemo<GeoJSON.FeatureCollection<GeoJSON.Polygon>>(
    () =>
      newH3Indexes
        ? {
            ...tracesH3Collection,
            features: tracesH3Collection.features.map((feature) => ({
              ...feature,
              properties: { ...feature.properties, isNew: newH3Indexes.has(`${feature.id}`) },
            })),
          }
        : tracesH3Collection,
    [tracesH3Collection, newH3Indexes],
  );
  const layersLabels = useMemo<{ [key in TLayer]: string }>(() => {
    return {
      tiles: 'Zones explorées',
      traces: 'Traces',
    };
  }, []);
  const exportSubtitle = useMemo(() => {
    if (!stats) return '';

    const parts = [`${formatDistance(stats.distance)} kms à vélo`];
    if (selectedLayers.includes('tiles') && h3Collection.features.length > 0)
      parts.push(`${h3Collection.features.length} tuiles explorées`);

    return parts.join(' - ');
  }, [selectedLayers, stats, h3Collection]);

  function handleChangeLayer({ currentTarget: { value, checked } }: ChangeEvent<HTMLInputElement>) {
    const layer = value as TLayer;

    selectLayers((current) =>
      checked
        ? current.includes(layer)
          ? current
          : [...current, layer]
        : current.filter((key) => key !== layer),
    );
  }

  return (
    <>
      <PrivatePage>
        <div className="flex flex-col items-stretch gap-12 grow @container">
          <div className="flex flex-col gap-6 shrink-0">
            <h1 className="text-lg font-bold">Ma heatmap</h1>
            <div className="flex flex-col @2xl:flex-row gap-6 items-stretch @2xl:items-center justify-between">
              <PeriodSelector
                period={period}
                periodTypes={['month', 'year', 'allTime']}
                setPeriod={setPeriod}
              />
              {(!tracesCollection || !isEmpty) && (
                <div className="flex justify-end">
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
              )}
            </div>
          </div>
          {isEmpty ? (
            <EmptyState period={period} />
          ) : (
            <>
              <HeatmapStats
                distance={stats?.distance}
                exploredZones={tracesCollection ? tracesH3Collection.features.length : undefined}
                newZones={newH3Indexes?.size}
                showNewZones={period.type !== 'allTime'}
              />
              <Map
                h3Collection={h3Collection}
                layersLabels={layersLabels}
                mapId="heatmap"
                onChangeLayer={handleChangeLayer}
                ref={mapRef}
                selectedLayers={selectedLayers}
                tracesCollection={tracesCollection}
              />
            </>
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
