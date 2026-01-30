import { cookies } from 'next/headers';
import { CookiesProvider } from 'next-client-cookies/server';

import { Providers } from '../providers';

import { Footer } from './footer';
import { Header } from './header';

export async function Wrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiesStore = await cookies();

  const cookiesStoreUserId = cookiesStore.get('user_id')?.value,
    cookiesStoreAuthorizationToken = cookiesStore.get('authorization_token')?.value;

  return (
    <CookiesProvider>
      <Providers
        cookiesStoreAuthorizationToken={cookiesStoreAuthorizationToken}
        cookiesStoreUserId={cookiesStoreUserId}
      >
        <div className="relative min-h-screen flex flex-col overflow-hidden">
          <Header />
          {children}
          <Footer />
        </div>
      </Providers>
    </CookiesProvider>
  );
}
