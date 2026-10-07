import { NextRequest, NextResponse } from 'next/server';

import { addOrUpdateUser, createSession, SESSION_MAX_AGE_SECONDS } from '../../../utils/db';
import { fetchGeovelo, SESSION_COOKIE } from '../../utils';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get('userId');
  const authorizationToken = searchParams.get('authorizationToken')?.replace('Token ', '');

  if (userId && authorizationToken) {
    const verification = await fetchGeovelo(
      `/v1/users/${encodeURIComponent(userId)}`,
      authorizationToken,
    ).catch(() => null);

    if (verification?.ok) {
      const user = (await verification.json()) as {
        username?: string;
        profile_picture?: string | null;
        created?: string;
      };

      addOrUpdateUser({
        geoveloId: userId,
        username: user.username ?? null,
        profilePicture: user.profile_picture ?? null,
        createdAt: user.created ?? null,
      });

      const response = NextResponse.redirect(new URL('/dashboard/stats', request.url));

      response.cookies.set(SESSION_COOKIE, createSession(userId), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_MAX_AGE_SECONDS,
        path: '/',
      });
      response.cookies.set('user_id', userId);
      response.cookies.set('authorization_token', authorizationToken);

      return response;
    }
  }

  return NextResponse.redirect(new URL('/login', request.url));
}
