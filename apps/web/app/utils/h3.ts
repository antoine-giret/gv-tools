import { cellToBoundary, gridDisk, gridRing, latLngToCell } from 'h3-js';

export function getLargestHexagonalClusterH3Indexes(h3Indexes: Set<string>): string[] {
  if (h3Indexes.size === 0) return [];

  let candidates = Array.from(h3Indexes);
  let bestRadius = 0;
  let bestCenter = candidates[0];

  let k = 1;
  while (candidates.length > 0) {
    const nextCandidates: string[] = [];

    for (const center of candidates) {
      const ring = gridRing(center, k);
      const isComplete = ring.length > 0 && ring.every((cell) => h3Indexes.has(cell));

      if (isComplete) {
        nextCandidates.push(center);
      }
    }

    if (nextCandidates.length > 0) {
      bestRadius = k;
      bestCenter = nextCandidates[0];
      candidates = nextCandidates;
      k += 1;
    } else {
      break;
    }
  }

  return gridDisk(bestCenter, bestRadius);
}

export function getH3FeatureCollection({
  collection,
}: {
  collection: GeoJSON.FeatureCollection<GeoJSON.LineString, object | null>;
}): GeoJSON.FeatureCollection<GeoJSON.Polygon, object | null> {
  const h3Indexes = new Set(
    collection.features.flatMap(({ geometry: { coordinates } }) =>
      coordinates.flatMap(([lng, lat]) => latLngToCell(lat, lng, 8)),
    ),
  );

  const largestAreaH3Indexes = new Set(getLargestHexagonalClusterH3Indexes(h3Indexes));

  return {
    type: 'FeatureCollection',
    features: Array.from(h3Indexes).map<GeoJSON.Feature<GeoJSON.Polygon, object>>((h3Index) => ({
      id: h3Index,
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [cellToBoundary(h3Index, true)] },
      properties: { isInLargestArea: largestAreaH3Indexes.has(h3Index) },
    })),
  };
}
