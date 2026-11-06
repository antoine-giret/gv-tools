import { NextRequest, NextResponse } from 'next/server';

import { getNewH3Cells } from '../../../../utils/db';
import { unauthorized } from '../../../utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const error = await unauthorized(request, id);
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const startDate = new Date(searchParams.get('start') || '');
  const endDate = new Date(searchParams.get('end') || '');

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
    return NextResponse.json({ detail: 'Invalid start or end.' }, { status: 400 });

  return NextResponse.json({ h3_indexes: await getNewH3Cells(id, startDate, endDate) });
}
