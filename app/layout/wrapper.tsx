import { cookies } from 'next/headers';
import { CookiesProvider } from 'next-client-cookies/server';

import { TUser } from '../models/user';
import { Providers } from '../providers';

import { Footer } from './footer';
import { Header } from './header';

export async function Wrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  async function getUser(): Promise<TUser | null> {
    const cookiesStore = await cookies();
    const userId = cookiesStore.get('user_id');
    const authorizationToken = cookiesStore.get('authorization_token');
    
    if (!userId || !authorizationToken) return null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_GV_BACKEND_URL}/api/v1/users/${userId.value}`, {
      method: 'GET',
      headers: {
        'Api-Key': process.env.NEXT_PUBLIC_GV_API_KEY || '',
        source: process.env.NEXT_PUBLIC_GV_SOURCE || '',
        Authorization: `Token ${authorizationToken.value}`,
      },
    });

    const { id, username, profile_picture } = await res.json();

    return {
      authorizationToken: authorizationToken.value,
      id,
      username,
      profilePicture: profile_picture ? `${process.env.NEXT_PUBLIC_GV_BACKEND_URL}${profile_picture}` : null,
    };
  }

  const user = await getUser();

  return (
    <CookiesProvider>
      <Providers user={user}>
        <div className="relative min-h-screen flex flex-col overflow-y-hidden">
          <Header />
          {children}
          <Footer />
        </div>
      </Providers>
    </CookiesProvider>
  );
}
