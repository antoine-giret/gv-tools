import { NextRequest, NextResponse } from 'next/server';

import { adminDeleteSessions, adminDeleteUser, adminUpdateUser } from '../../../../utils/db';
import { adminUnauthorized } from '../../utils';

type Params = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ detail: 'Not found.' }, { status: 404 });

export async function PATCH(request: NextRequest, { params }: Params) {
  const error = adminUnauthorized(request);
  if (error) return error;

  const id = Number((await params).id);
  const body = (await request.json().catch(() => ({}))) as {
    username?: string | null;
    profilePicture?: string | null;
  };

  return adminUpdateUser(id, body) ? NextResponse.json({ ok: true }) : notFound();
}

// ?sessions=1 only revokes the user's sessions, otherwise the user is deleted
export async function DELETE(request: NextRequest, { params }: Params) {
  const error = adminUnauthorized(request);
  if (error) return error;

  const id = Number((await params).id);

  if (request.nextUrl.searchParams.get('sessions')) {
    adminDeleteSessions(id);

    return NextResponse.json({ ok: true });
  }

  return adminDeleteUser(id) ? NextResponse.json({ ok: true }) : notFound();
}
