'use client';

import { GeoJSONSource, LngLatBounds, Map as MaplibreMap, PaddingOptions } from 'maplibre-gl';
import {
  ChangeEvent,
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { getBounds } from '../../utils/map';

import { Legend } from './legend';
import { LegendControl } from './legend-control';
import { layers, TLayer } from './types';

const tracesSourceId = 'traces';
const tracesLayerId = 'traces';
const tilesSourceId = 'tiles';
const tilesLayerId = 'tiles';
const newTilesLayerId = 'new-tiles';

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
    h3Collection,
    selectedLayers,
    setReady,
    onChangeLayer,
    layersLabels,
  }: {
    exported?: boolean;
    h3Collection: GeoJSON.FeatureCollection<GeoJSON.Polygon> | undefined;
    initialBounds?: LngLatBounds;
    mapId: string;
    padding?: number | PaddingOptions;
    selectedLayers: TLayer[];
    setReady?: (ready: boolean) => void;
    tracesCollection: GeoJSON.FeatureCollection<GeoJSON.LineString> | undefined;
    onChangeLayer?: (event: ChangeEvent<HTMLInputElement>) => void;
    layersLabels?: { [key in TLayer]: string };
  },
  ref: Ref<TMapRef>,
) {
  const [mapInitialized, setMapInitialized] = useState(false);
  const [legendContent, setLegendContent] = useState<HTMLDivElement | null>(null);
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

    function initSources() {
      if (!mapRef.current) return;

      if (!mapRef.current.getSource(tracesSourceId)) {
        mapRef.current.addSource(tracesSourceId, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }

      if (!mapRef.current.getSource(tilesSourceId)) {
        mapRef.current.addSource(tilesSourceId, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
      }
    }

    function initLayers() {
      if (!mapRef.current) return;

      mapRef.current.addLayer(
        {
          id: tilesLayerId,
          type: 'fill',
          source: tilesSourceId,
          layout: {
            visibility: selectedLayers.includes('tiles') ? 'visible' : 'none',
          },
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['get', 'isInLargestArea'], false],
              '#ec4899',
              '#00bc7d',
            ],
            'fill-opacity': 0.5,
          },
        },
        'waterway_label',
      );

      // Fill layers have no outline width, so new tiles get their own line layer
      mapRef.current.addLayer(
        {
          id: newTilesLayerId,
          type: 'line',
          source: tilesSourceId,
          filter: ['boolean', ['get', 'isNew'], false],
          layout: {
            visibility: selectedLayers.includes('tiles') ? 'visible' : 'none',
            'line-join': 'round',
          },
          paint: {
            'line-color': [
              'case',
              ['boolean', ['get', 'isInLargestArea'], false],
              '#ec4899',
              '#00bc7d',
            ],
            'line-width': 2,
          },
        },
        'waterway_label',
      );

      mapRef.current.addLayer(
        {
          id: tracesLayerId,
          type: 'line',
          source: tracesSourceId,
          layout: {
            visibility: selectedLayers.includes('traces') ? 'visible' : 'none',
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#00bc7d',
            'line-opacity': 0.5,
            'line-width': 5,
          },
        },
        tilesLayerId,
      );
    }

    function handleLoad() {
      initSources();
      initLayers();

      if (!exported && onChangeLayer && layersLabels) {
        const legendControl = new LegendControl();
        mapRef.current?.addControl(legendControl, 'top-right');
        setLegendContent(legendControl.legendContent);
      }

      setMapInitialized(true);
    }

    initMap();
    mapRef.current?.on('load', handleLoad);

    return () => {
      mapRef.current?.off('load', handleLoad);
      mapRef.current?.remove();
      mapRef.current = null;
      setLegendContent(null);
      setMapInitialized(false);
    };
  }, []);

  useEffect(() => {
    async function updateSource(
      collection: GeoJSON.FeatureCollection<GeoJSON.LineString>,
      h3Collection: GeoJSON.FeatureCollection<GeoJSON.Polygon>,
    ) {
      const tracesSource = mapRef.current?.getSource(tracesSourceId);
      if (tracesSource && tracesSource instanceof GeoJSONSource) {
        await tracesSource.setData(collection, true);
      }

      const tilesSource = mapRef.current?.getSource(tilesSourceId);
      if (tilesSource && tilesSource instanceof GeoJSONSource) {
        await tilesSource.setData(h3Collection, true);
      }

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

    if (mapInitialized && tracesCollection && h3Collection)
      updateSource(tracesCollection, h3Collection);

    return () => {
      const tracesSource = mapRef.current?.getSource(tracesSourceId);
      if (tracesSource && tracesSource instanceof GeoJSONSource) {
        tracesSource.setData({ type: 'FeatureCollection', features: [] });
      }

      const tilesSource = mapRef.current?.getSource(tilesSourceId);
      if (tilesSource && tilesSource instanceof GeoJSONSource) {
        tilesSource.setData({ type: 'FeatureCollection', features: [] });
      }
    };
  }, [mapInitialized, tracesCollection, h3Collection]);

  useEffect(() => {
    if (mapInitialized) {
      mapRef.current?.setLayoutProperty(
        tracesLayerId,
        'visibility',
        selectedLayers.includes('traces') ? 'visible' : 'none',
      );

      for (const layerId of [tilesLayerId, newTilesLayerId])
        mapRef.current?.setLayoutProperty(
          layerId,
          'visibility',
          selectedLayers.includes('tiles') ? 'visible' : 'none',
        );
    }
  }, [mapInitialized, selectedLayers]);

  return (
    <>
      <div className={`grow relative ${exported ? '' : 'min-h-[400px]'}`} id={mapId}>
        {!exported && !tracesCollection && (
          <div className="absolute top-0 left-0 w-full h-full bg-black/70 flex items-center justify-center z-100">
            <div className="inline-block w-10 h-10 border-5 border-b-transparent border-emerald-500 rounded-full box-border animate-spin" />
          </div>
        )}
      </div>
      {legendContent &&
        onChangeLayer &&
        layersLabels &&
        createPortal(
          <Legend
            layers={layers}
            layersLabels={layersLabels}
            onChangeLayer={onChangeLayer}
            selectedLayers={selectedLayers}
          />,
          legendContent,
        )}
    </>
  );
}

export const Map = forwardRef(MapRender);
