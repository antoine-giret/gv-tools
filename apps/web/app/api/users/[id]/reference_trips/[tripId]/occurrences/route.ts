import { NextRequest } from 'next/server';

import { proxyToGeovelo } from '../../../../../utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tripId: string }> },
) {
  const { id, tripId } = await params;

  return proxyToGeovelo(
    request,
    id,
    `/v3/users/${encodeURIComponent(id)}/reference_trips/${encodeURIComponent(tripId)}/occurrences`,
  );
}
