import { NextRequest, NextResponse } from 'next/server';

import { GeoveloSyncError, getTracesSyncProgress, syncTraces } from '../../../../utils/traces-sync';
import { unauthorized } from '../../../utils';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const error = await unauthorized(request, id);
  if (error) return error;

  try {
    const tracesSyncedAt = await syncTraces(
      id,
      request.cookies.get('authorization_token')?.value || '',
    );

    return NextResponse.json({ traces_synced_at: tracesSyncedAt.toISOString() });
  } catch (err) {
    console.error('Traces sync failed', err);

    const status = err instanceof GeoveloSyncError && err.status === 401 ? 401 : 502;
    return NextResponse.json({ detail: 'Traces sync failed.' }, { status });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const error = await unauthorized(request, id);
  if (error) return error;

  return NextResponse.json({ progress: getTracesSyncProgress(id) });
}
