import { NextRequest, NextResponse } from 'next/server';

import { getH3Cells } from '../../../../utils/db';
import { unauthorized } from '../../../utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const error = await unauthorized(request, id);
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  if (start === null && end === null)
    return NextResponse.json({ h3_indexes: await getH3Cells(id) });

  const startDate = new Date(start ?? '');
  const endDate = new Date(end ?? '');
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate >= endDate)
    return NextResponse.json({ detail: 'Invalid start or end.' }, { status: 400 });

  return NextResponse.json({ h3_indexes: await getH3Cells(id, startDate, endDate) });
}
