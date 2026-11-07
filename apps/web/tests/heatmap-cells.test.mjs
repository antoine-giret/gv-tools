import assert from 'node:assert/strict';
import { test } from 'node:test';

import { gridDisk, latLngToCell } from 'h3-js';

import { getH3FeatureCollection } from '../app/utils/h3.ts';
import { getPeriodBounds } from '../app/utils/period.ts';

test('builds the explored zones and largest area from stored cell indexes', () => {
  const center = latLngToCell(48.8566, 2.3522, 8);
  const cells = new Set(gridDisk(center, 1));
  const isolated = latLngToCell(43.6045, 1.444, 8);
  cells.add(isolated);

  const collection = getH3FeatureCollection(cells);

  assert.equal(collection.features.length, cells.size);
  assert.deepEqual(new Set(collection.features.map(({ id }) => id)), cells);
  assert.equal(
    collection.features.find(({ id }) => id === isolated).properties.isInLargestArea,
    false,
  );
  assert.equal(
    collection.features.filter(({ properties }) => properties.isInLargestArea).length,
    7,
  );
});

test('handles no stored cells', () => {
  const collection = getH3FeatureCollection(new Set());
  assert.deepEqual(collection, { type: 'FeatureCollection', features: [] });
});

test('period bounds cover complete local days with an exclusive end', () => {
  const startDate = new Date(2026, 2, 1, 12);
  const endDate = new Date(2026, 2, 31, 12);
  const { start, end } = getPeriodBounds({ type: 'month', startDate, endDate });

  assert.equal(start.getTime(), new Date(2026, 2, 1).getTime());
  assert.equal(end.getTime(), new Date(2026, 3, 1).getTime());
  assert.equal(startDate.getHours(), 12);
  assert.equal(endDate.getHours(), 12);
});
