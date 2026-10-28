import { NextRequest, NextResponse } from 'next/server';

import { addOrUpdateUser, createSession, SESSION_MAX_AGE_SECONDS } from '../../../utils/db';
import { fetchGeovelo, SESSION_COOKIE } from '../../utils';

// request.url carries the server's bind address (e.g. 0.0.0.0), not the host the cookies are set on
function frontendUrl(path: string, request: NextRequest) {
  return new URL(path, process.env.NEXT_PUBLIC_FRONTEND_URL || request.url);
}

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

      await addOrUpdateUser({
        geoveloId: userId,
        username: user.username ?? null,
        profilePicture: user.profile_picture ?? null,
        createdAt: user.created ?? null,
      });

      const response = NextResponse.redirect(frontendUrl('/dashboard/stats', request));

      response.cookies.set(SESSION_COOKIE, await createSession(userId), {
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

  return NextResponse.redirect(frontendUrl('/login', request));
}
