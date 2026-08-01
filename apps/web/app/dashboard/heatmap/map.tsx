'use client';

import { GeoJSONSource, LngLatBounds, Map as MaplibreMap, PaddingOptions } from 'maplibre-gl';
import { forwardRef, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { getBounds } from '../../utils/map';

const sourceId = 'traces';

export type TMapRef = {
  getBounds: () => LngLatBounds | undefined;
};

function MapRender(
  {
    exported,
    mapId,
    initialBounds,
    padding,
    tracesCollection,
    setReady,
  }: {
    exported?: boolean;
    initialBounds?: LngLatBounds;
    mapId: string;
    padding?: number | PaddingOptions;
    setReady?: (ready: boolean) => void;
    tracesCollection: GeoJSON.FeatureCollection<GeoJSON.LineString> | undefined;
  },
  ref: Ref<TMapRef>,
) {
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<MaplibreMap>(null);

  useImperativeHandle(ref, () => ({ getBounds: () => mapRef.current?.getBounds() }));

  useEffect(() => {
    function initMap() {
      if (!mapRef.current) {
        mapRef.current = new MaplibreMap({
          container: mapId,
          style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
          bounds: initialBounds ?? [-4.8146088, 42.3333482, 8.172476, 51.074681],
          fitBoundsOptions: { padding: padding ?? 50 },
          canvasContextAttributes: {
            preserveDrawingBuffer: exported,
          },
        });
      }
    }

    function initSource() {
      if (!mapRef.current) return;

      if (!mapRef.current.getSource(sourceId)) {
        mapRef.current.addSource(sourceId, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }
    }

    function initLayers() {
      if (!mapRef.current) return;

      mapRef.current.addLayer(
        {
          id: 'traces',
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#00bc7d',
            'line-opacity': 0.5,
            'line-width': 5,
          },
        },
        'waterway_label',
      );
    }

    function handleLoad() {
      initSource();
      initLayers();
      setMapInitialized(true);
    }

    initMap();
    mapRef.current?.on('load', handleLoad);

    return () => {
      mapRef.current?.off('load', handleLoad);
      mapRef.current?.remove();
      mapRef.current = null;
      setMapInitialized(false);
    };
  }, []);

  useEffect(() => {
    async function updateSource(collection: GeoJSON.FeatureCollection<GeoJSON.LineString>) {
      const source = mapRef.current?.getSource(sourceId);
      if (source && source instanceof GeoJSONSource) {
        await source.setData(collection, true);
        if (!initialBounds) {
          const bounds = getBounds(collection);
          if (bounds)
            mapRef.current?.fitBounds(bounds, {
              padding: 50,
              animate: exported ? false : true,
              maxDuration: 1000,
            });
        }
        mapRef.current?.once('idle', () => setReady?.(true));
      }
    }

    if (mapInitialized && tracesCollection) updateSource(tracesCollection);

    return () => {
      const source = mapRef.current?.getSource(sourceId);
      if (source && source instanceof GeoJSONSource) {
        source.setData({ type: 'FeatureCollection', features: [] });
      }
    };
  }, [mapInitialized, tracesCollection]);

  return (
    <div className="grow relative" id={mapId}>
      {!exported && !tracesCollection && (
        <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-100">
          <div className="inline-block w-10 h-10 border-5 border-b-transparent border-emerald-500 rounded-full box-border animate-spin" />
        </div>
      )}
    </div>
  );
}

export const Map = forwardRef(MapRender);
