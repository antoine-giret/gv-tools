import { NextRequest, NextResponse } from 'next/server';

import { getUser } from '../../../utils/db';
import { unauthorized } from '../../utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const error = await unauthorized(request, id);
  if (error) return error;

  const user = await getUser(id);

  if (!user) return NextResponse.json({ detail: 'Not found.' }, { status: 404 });

  return NextResponse.json({
    id: Number(user.geoveloId),
    username: user.username,
    profile_picture: user.profilePicture,
    created: user.createdAt,
  });
}
