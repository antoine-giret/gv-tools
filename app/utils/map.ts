import { LngLatBounds } from 'maplibre-gl';

export function getBounds({ features }: GeoJSON.FeatureCollection<GeoJSON.LineString>) {
  if (!features[0] || !features[0].geometry.coordinates[0]) return null;

  const [lng, lat] = features[0].geometry.coordinates[0];

  const bounds = new LngLatBounds(
    [lng, lat],
    [lng, lat],
  );

  for (const feature of features) {
    for (const [lng, lat] of feature.geometry.coordinates) {
      bounds.extend([lng, lat]);
    }
  }

  return bounds;
}
