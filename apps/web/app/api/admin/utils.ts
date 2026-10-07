import { timingSafeEqual } from 'node:crypto';

import { NextRequest, NextResponse } from 'next/server';

function safeEqual(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

// Admin is disabled unless ADMIN_USERNAME and ADMIN_PASSWORD are set; credentials use HTTP Basic auth
export function adminUnauthorized(request: NextRequest) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const encoded = request.headers.get('authorization')?.replace(/^Basic /, '') || '';
  const decoded = Buffer.from(encoded, 'base64').toString();
  const separator = decoded.indexOf(':');
  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  const valid =
    !!expectedUsername &&
    !!expectedPassword &&
    separator >= 0 &&
    // Both comparisons always run to avoid leaking which one failed
    [safeEqual(username, expectedUsername), safeEqual(password, expectedPassword)].every(Boolean);

  return valid ? null : NextResponse.json({ detail: 'Unauthorized.' }, { status: 401 });
}
