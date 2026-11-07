'use client';

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { LngLatBounds } from 'maplibre-gl';
import { ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Button, Card, PeriodSelector } from '../../components';
import { EmptyState } from '../../components/empty-state';
import { UserContext } from '../../context';
import PrivatePage from '../../guards/private';
import { useH3Cells } from '../../hooks/queries/use-h3-cells';
import { useNewH3Cells } from '../../hooks/queries/use-new-h3-cells';
import { useStats } from '../../hooks/queries/use-stats';
import { useTraces } from '../../hooks/queries/use-traces';
import { useTracesSync } from '../../hooks/queries/use-traces-sync';
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
  const {
    isFetching: isSyncing,
    isError: syncError,
    refetch: refetchSync,
  } = useTracesSync(signedInUser);
  const {
    data: h3Indexes,
    isError: h3Error,
    refetch: refetchH3,
  } = useH3Cells({ user: signedInUser, period });
  const {
    data: newH3Indexes,
    isError: newH3Error,
    refetch: refetchNewH3,
  } = useNewH3Cells({ user: signedInUser, period });
  const {
    data: tracesCollection,
    isFetching,
    isError: tracesError,
    refetch: refetchTraces,
  } = useTraces({ user: signedInUser, period });
  const isEmpty = useMemo(
    () =>
      tracesCollection &&
      h3Indexes &&
      tracesCollection.features.length === 0 &&
      h3Indexes.size === 0,
    [tracesCollection, h3Indexes],
  );
  const exploredH3Collection = useMemo(
    () => (h3Indexes ? getH3FeatureCollection(h3Indexes) : undefined),
    [h3Indexes],
  );
  // Flagged apart so that the largest area is not computed again once the new tiles are known
  const h3Collection = useMemo(
    () =>
      newH3Indexes && exploredH3Collection
        ? {
            ...exploredH3Collection,
            features: exploredH3Collection.features.map((feature) => ({
              ...feature,
              properties: { ...feature.properties, isNew: newH3Indexes.has(`${feature.id}`) },
            })),
          }
        : exploredH3Collection,
    [exploredH3Collection, newH3Indexes],
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
    if (selectedLayers.includes('tiles') && h3Collection && h3Collection.features.length > 0)
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
              {!isEmpty && (
                <div className="flex justify-end">
                  <Button
                    disabled={
                      isFetching ||
                      !tracesCollection ||
                      !h3Collection ||
                      (selectedLayers.includes('tiles') &&
                        period.type !== 'allTime' &&
                        !newH3Indexes) ||
                      selectedLayers.length === 0 ||
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
          {isSyncing && (
            <Card>
              <div className="flex items-center gap-3 p-4" role="status">
                <InformationCircleIcon
                  aria-hidden="true"
                  className="size-5 shrink-0 text-emerald-500 dark:text-emerald-300"
                />
                <p>
                  Synchronisation des données en cours. Les zones explorées seront mises à jour une
                  fois la synchronisation terminée.
                </p>
              </div>
            </Card>
          )}
          {(syncError || h3Error || newH3Error || tracesError) && (
            <div className="flex flex-col items-center gap-3 text-center" role="alert">
              <p>Impossible de charger toutes les données de la heatmap. Réessayez.</p>
              <Button
                label="Réessayer"
                onClick={() => {
                  if (syncError) void refetchSync();
                  if (h3Error) void refetchH3();
                  if (newH3Error) void refetchNewH3();
                  if (tracesError) void refetchTraces();
                }}
              />
            </div>
          )}
          {isEmpty ? (
            <EmptyState period={period} />
          ) : (
            <>
              <HeatmapStats
                distance={stats?.distance}
                exploredZones={h3Indexes?.size}
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
      {tracesCollection && h3Collection && downloading && (
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
