import { Ref } from 'react';

import { ExportLayout } from '../stats/layouts/export';

import { Map } from './map';

export function HeatmapExport(
  {
    ref,
    title,
    subtitle,
    mapId,
    tracesCollection,
    setReady,
  }: {
    mapId: string;
    ref: Ref<HTMLDivElement>;
    subtitle: string;
    title: string;
    tracesCollection: GeoJSON.FeatureCollection<GeoJSON.LineString>;
    setReady?: (ready: boolean) => void;
  },
) {
  return (
    <ExportLayout ref={ref} subtitle={subtitle} title={title}>
      <div className="w-full aspect-square flex flex-col">
        <Map exported mapId={mapId} tracesCollection={tracesCollection} setReady={setReady} />
      </div>
    </ExportLayout>
  );
}