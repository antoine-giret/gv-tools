import { NextRequest, NextResponse } from 'next/server';

import { getTracesSyncProgress, syncTraces } from '../../../../utils/traces-sync';
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

    return NextResponse.json({ detail: 'Traces sync failed.' }, { status: 502 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const error = await unauthorized(request, id);
  if (error) return error;

  return NextResponse.json({ progress: getTracesSyncProgress(id) });
}
