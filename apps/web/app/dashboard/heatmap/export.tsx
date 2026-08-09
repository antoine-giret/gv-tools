import { LngLatBounds } from 'maplibre-gl';
import { Ref } from 'react';

import { Map } from './map';
import { TLayer } from './types';

export function HeatmapExport({
  initialBounds,
  ref,
  title,
  titleClassName,
  subtitle,
  subtitleClassName,
  mapId,
  tracesCollection,
  h3Collection,
  selectedLayers,
  setReady,
}: {
  h3Collection: GeoJSON.FeatureCollection<GeoJSON.Polygon>;
  initialBounds: LngLatBounds | undefined;
  mapId: string;
  ref: Ref<HTMLDivElement>;
  subtitle: string;
  subtitleClassName?: string;
  title: string;
  titleClassName?: string;
  tracesCollection: GeoJSON.FeatureCollection<GeoJSON.LineString>;
  selectedLayers: TLayer[];
  setReady?: (ready: boolean) => void;
}) {
  return (
    <div className="absolute top-[100%] h-[1920px] w-[1080px] bg-slate-900" ref={ref}>
      <div className="flex flex-col relative h-full w-full">
        <Map
          exported
          h3Collection={h3Collection}
          initialBounds={initialBounds}
          mapId={mapId}
          padding={{ top: 525, left: 100, right: 100, bottom: 100 }}
          selectedLayers={selectedLayers}
          setReady={setReady}
          tracesCollection={tracesCollection}
        />
        <div className="absolute top-[200px] left-[50px] right-[50px] px-[100px] py-[50px] flex flex-col gap-[25px] bg-slate-900/80 rounded-2xl">
          <span
            className={`font-(family-name:--font-titan-one) text-6xl font-normal text-center text-white ${titleClassName}`}
          >
            {title}
          </span>
          <span
            className={`text-4xl font-normal text-center capitalize text-white ${subtitleClassName}`}
          >
            {subtitle}
          </span>
        </div>
      </div>
    </div>
  );
}
