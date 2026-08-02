import { cellToBoundary, latLngToCell } from 'h3-js';

export function getH3FeatureCollection({
  collection,
}: {
  collection: GeoJSON.FeatureCollection<GeoJSON.LineString, object | null>;
}): GeoJSON.FeatureCollection<GeoJSON.Polygon, object | null> {
  const h3Indexes = [
    ...new Set(
      collection.features.flatMap(({ geometry: { coordinates } }) =>
        coordinates.flatMap(([lng, lat]) => latLngToCell(lat, lng, 7)),
      ),
    ),
  ];

  return {
    type: 'FeatureCollection',
    features: h3Indexes.map<GeoJSON.Feature<GeoJSON.Polygon, object>>((h3Index) => ({
      id: h3Index,
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [cellToBoundary(h3Index, true)] },
      properties: {},
    })),
  };
}
