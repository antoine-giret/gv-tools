import { NextRequest } from 'next/server';

import { proxyToGeovelo } from '../../../utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return proxyToGeovelo(request, id, `/v2/users/${encodeURIComponent(id)}/stats_traces`);
}
