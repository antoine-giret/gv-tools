import { NextRequest, NextResponse } from 'next/server';

import { getSessionGeoveloId } from '../utils/db';

export const SESSION_COOKIE = 'session_token';

// Returns an error response unless the session token belongs to the requested user
export function unauthorized(request: NextRequest, userId: string) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token || getSessionGeoveloId(token) !== userId)
    return NextResponse.json({ detail: 'Unauthorized.' }, { status: 401 });

  return null;
}

export function fetchGeovelo(endpoint: string, authorizationToken?: string, search = '') {
  return fetch(`${process.env.NEXT_PUBLIC_GV_BACKEND_URL}/api${endpoint}${search}`, {
    headers: {
      'Api-Key': process.env.NEXT_PUBLIC_GV_API_KEY || '',
      source: process.env.NEXT_PUBLIC_GV_SOURCE || '',
      ...(authorizationToken ? { Authorization: `Token ${authorizationToken}` } : {}),
    },
  });
}

export async function proxyToGeovelo(request: NextRequest, userId: string, endpoint: string) {
  const error = unauthorized(request, userId);
  if (error) return error;

  const response = await fetchGeovelo(
    endpoint,
    request.cookies.get('authorization_token')?.value,
    request.nextUrl.search,
  );

  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  });
}
