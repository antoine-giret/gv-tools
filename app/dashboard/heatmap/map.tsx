'use client';

import { GeoJSONSource, Map as MaplibreMap } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';

import { getBounds } from '../../utils/map';

const sourceId = 'traces'

export function Map({
  exported,
  mapId,
  tracesCollection,
  setReady,
}: {
  exported?: boolean;
  mapId: string;
  setReady?: (ready: boolean) => void;
  tracesCollection: GeoJSON.FeatureCollection<GeoJSON.LineString> | undefined;
}) {
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<MaplibreMap>(null);

  useEffect(() => {
    function initMap() {
      if (!mapRef.current) {
        mapRef.current = new MaplibreMap({
          container: mapId,
          style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
          bounds: [-4.8146088, 42.3333482, 8.172476, 51.074681],
          fitBoundsOptions: { padding: 50 },
          canvasContextAttributes: {
            preserveDrawingBuffer: exported,
          }
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

      mapRef.current.addLayer({
        'id': 'traces',
        'type': 'line',
        'source': sourceId,
        'layout': {
          'line-join': 'round',
          'line-cap': 'round',
        },
        'paint': {
          'line-color': '#00bc7d',
          'line-opacity': 0.5,
          'line-width': 5,
        }
      }, 'waterway_label');
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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function updateSource(collection: GeoJSON.FeatureCollection<GeoJSON.LineString>) {
      const source = mapRef.current?.getSource(sourceId);
      if (source && source instanceof GeoJSONSource) {
        await source.setData(collection, true);
        const bounds = getBounds(collection);
        if (bounds)
          mapRef.current?.fitBounds(bounds, { padding: 50, animate: exported ? false : true, maxDuration: 1000 });
        mapRef.current?.once('idle', () => setReady?.(true));
      }
    }

    if (mapInitialized && tracesCollection) updateSource(tracesCollection);

    return () => {
      const source = mapRef.current?.getSource(sourceId);
      if (source && source instanceof GeoJSONSource) {
        source.setData({ type: 'FeatureCollection', features: [] });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
