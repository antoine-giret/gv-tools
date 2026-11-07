import { latLngToCell } from 'h3-js';

import { fetchGeovelo } from '../api/utils';

import { addH3Cells, getStoredTraceIds, getTracesSyncedAt, setTracesSyncedAt } from './db';

const H3_RESOLUTION = 8;
const PAGE_SIZE = 100;
const DETAILS_CONCURRENCY = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
// A trace is only valid once cleaned by Geovelo, which may still happen during this delay
const CLEANING_DELAY_MS = 7 * DAY_MS;

type TTrace = {
  cleaned_version: number | null;
  geometry?: GeoJSON.LineString | null;
  id: number;
  start_datetime: string | null;
};

type TSyncProgress = { page: number; pages: number | null };

export class GeoveloSyncError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const globalForSync = globalThis as unknown as {
  tracesSyncs?: Map<string, Promise<Date>>;
  tracesSyncsProgress?: Map<string, TSyncProgress>;
};
const inProgressSyncs = (globalForSync.tracesSyncs ??= new Map<string, Promise<Date>>());
// Pages processed by the sync in progress, out of the pages returned by Geovelo
const syncsProgress = (globalForSync.tracesSyncsProgress ??= new Map<string, TSyncProgress>());

// %d-%m-%Y, the format expected by Geovelo for custom periods
function formatDate(date: Date) {
  const [year, month, day] = date.toISOString().slice(0, 10).split('-');

  return `${day}-${month}-${year}`;
}

async function fetchJson<T>(endpoint: string, authorizationToken: string, search: string) {
  const response = await fetchGeovelo(endpoint, authorizationToken, search);
  if (!response.ok)
    throw new GeoveloSyncError(
      response.status,
      `Geovelo ${endpoint} responded ${response.status}: ${await response.text()}`,
    );

  return response.json() as Promise<T>;
}

// The list endpoint rejects the geometry field, so it is fetched trace by trace
async function fillGeometries(geoveloId: string, authorizationToken: string, traces: TTrace[]) {
  for (let i = 0; i < traces.length; i += DETAILS_CONCURRENCY) {
    await Promise.all(
      traces.slice(i, i + DETAILS_CONCURRENCY).map(async (trace) => {
        const { geometry } = await fetchJson<Pick<TTrace, 'geometry'>>(
          `/v6/users/${encodeURIComponent(geoveloId)}/traces/${trace.id}`,
          authorizationToken,
          `?${new URLSearchParams({ query: '{geometry}' })}`,
        );
        trace.geometry = geometry ?? null;
      }),
    );
  }
}

function getTraceCells({ id, start_datetime, geometry }: TTrace) {
  const h3Indexes = new Set(
    (geometry?.coordinates ?? []).map(([lng, lat]) =>
      latLngToCell(lat as number, lng as number, H3_RESOLUTION),
    ),
  );

  return Array.from(h3Indexes, (h3Index) => ({ h3Index, traceId: id, visitedAt: start_datetime }));
}

async function syncUserTraces(geoveloId: string, authorizationToken: string) {
  const syncStartedAt = new Date();
  const tracesSyncedAt = await getTracesSyncedAt(geoveloId);
  // Ordered by creation so that new traces are appended to the last pages
  const search = new URLSearchParams({
    query: '{id, start_datetime, cleaned_version}',
    ordering: 'created',
    page_size: `${PAGE_SIZE}`,
  });

  if (tracesSyncedAt) {
    // The filter is on dates only: widen it by a day to absorb timezones,
    // already stored traces are ignored on insert
    search.set('period', 'custom');
    search.set('field_name', 'created');
    search.set('date_start', formatDate(new Date(tracesSyncedAt.getTime() - DAY_MS)));
    search.set('date_end', formatDate(new Date(syncStartedAt.getTime() + DAY_MS)));
  }

  let syncedUntil = 0;
  // Start of the first trace waiting to be cleaned: the sync date must not go past it
  let pendingFrom = Infinity;
  const progress: TSyncProgress = { page: 0, pages: null };
  syncsProgress.set(geoveloId, progress);

  for (let page = 1, hasNext = true; hasNext; page++) {
    search.set('page', `${page}`);
    const { count, results, next } = await fetchJson<{
      count?: number;
      next: string | null;
      results: TTrace[];
    }>(`/v6/users/${encodeURIComponent(geoveloId)}/traces`, authorizationToken, `?${search}`);
    if (count !== undefined) progress.pages = Math.max(1, Math.ceil(count / PAGE_SIZE));

    const storedTraceIds = await getStoredTraceIds(
      geoveloId,
      results.map(({ id }) => id),
    );
    const traces = results.filter(
      ({ id, cleaned_version }) => cleaned_version !== null && !storedTraceIds.has(id),
    );

    await fillGeometries(geoveloId, authorizationToken, traces);
    await addH3Cells(geoveloId, traces.flatMap(getTraceCells));

    // The creation date is not exposed, but a trace is created after it starts: the latest
    // start date processed is a lower bound of the creation of the traces left to sync
    for (const { start_datetime, cleaned_version } of results) {
      if (!start_datetime) continue;

      const startTime = new Date(start_datetime).getTime();
      if (cleaned_version === null && startTime > syncStartedAt.getTime() - CLEANING_DELAY_MS)
        pendingFrom = Math.min(pendingFrom, startTime);
      else syncedUntil = Math.max(syncedUntil, startTime);
    }
    if (syncedUntil)
      await setTracesSyncedAt(geoveloId, new Date(Math.min(syncedUntil, pendingFrom)));

    progress.page = page;
    hasNext = !!next;
  }

  await setTracesSyncedAt(geoveloId, new Date(Math.min(syncStartedAt.getTime(), pendingFrom)));

  return syncStartedAt;
}

// Concurrent calls for the same user share the sync in progress
export function syncTraces(geoveloId: string, authorizationToken: string) {
  let sync = inProgressSyncs.get(geoveloId);

  if (!sync) {
    sync = syncUserTraces(geoveloId, authorizationToken).finally(() => {
      inProgressSyncs.delete(geoveloId);
      syncsProgress.delete(geoveloId);
    });
    inProgressSyncs.set(geoveloId, sync);
  }

  return sync;
}

export function getTracesSyncProgress(geoveloId: string) {
  return syncsProgress.get(geoveloId) ?? null;
}
