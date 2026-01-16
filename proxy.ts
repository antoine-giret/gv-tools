import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const url = new URL(request.url);

  const userId = url.searchParams.get('userId');
  const authorizationToken = url.searchParams.get('authorizationToken');

  if (userId && authorizationToken) {
    const response = NextResponse.redirect(new URL('/dashboard/stats', request.url));

    response.cookies.set('user_id', userId);
    response.cookies.set('authorization_token', authorizationToken?.replace('Token ', ''));

    return response;
  }

  return NextResponse.rewrite(new URL('/login', request.url));
}

export const config = {
  matcher: ['/login/callback'],
};
