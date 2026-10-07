import { NextResponse } from 'next/server';

export function GET() {
  const url = new URL(`${process.env.NEXT_PUBLIC_GV_FRONTEND_URL}/fr/sign-in/`);

  url.searchParams.set(
    'redirect-url',
    `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/login/callback`,
  );
  url.searchParams.set('redirect-params', 'userId,authorizationToken');

  return NextResponse.redirect(url);
}
