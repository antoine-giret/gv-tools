import { LngLatBounds } from 'maplibre-gl';

export function getBounds({
  features,
}: GeoJSON.FeatureCollection<GeoJSON.LineString | GeoJSON.Polygon>) {
  const bounds = new LngLatBounds();

  for (const feature of features) {
    const lines =
      feature.geometry.type === 'LineString'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;
    for (const line of lines) for (const [lng, lat] of line) bounds.extend([lng, lat]);
  }

  return bounds.isEmpty() ? null : bounds;
}
