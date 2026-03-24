'use client';

import { TUser } from '@repo/models';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useCookies } from 'next-client-cookies';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';

import { UserContext } from './context';
import { useUser } from './hooks/queries/use-user';

const queryClient = new QueryClient();

function LocalStorageProvider({
  cookiesStoreUserId,
  cookiesStoreAuthorizationToken,
  children,
  setSignedInUser,
}: Readonly<{
  children: React.ReactNode;
  cookiesStoreAuthorizationToken: string | undefined;
  cookiesStoreUserId: string | undefined;
  setSignedInUser: (user: TUser | null) => void;
}>) {
  const [authData] = useState(() => {
    let userId: number | undefined, authorizationToken: string | undefined;

    if (cookiesStoreUserId) {
      userId = parseInt(cookiesStoreUserId);
      authorizationToken = cookiesStoreAuthorizationToken || '';
    } else {
      try {
        const localStorageUserId = localStorage.getItem('user_id');
        const localStorageAuthorizationToken = localStorage.getItem('authorization_token');

        if (localStorageUserId) {
          userId = parseInt(localStorageUserId);
          authorizationToken = localStorageAuthorizationToken || '';
        }
      } catch (err) {
        console.error(err);
      }
    }

    if (userId && !Number.isNaN(userId) && authorizationToken)
      return { userId, authorizationToken };

    return null;
  });

  const { data: userData } = useUser(authData);

  useEffect(() => {
    if (userData && authData) {
      const { id, username, profile_picture } = userData;
      const { authorizationToken } = authData;

      try {
        localStorage.setItem('user_id', `${id}`);
        localStorage.setItem('authorization_token', authorizationToken);
      } catch (err) {
        console.error(err);
      }

      setSignedInUser({
        id,
        authorizationToken,
        username,
        profilePicture: profile_picture
          ? `${process.env.NEXT_PUBLIC_GV_BACKEND_URL}${profile_picture}`
          : null,
      });
    } else if (authData === null) {
      try {
        localStorage.removeItem('user_id');
        localStorage.removeItem('authorization_token');
      } catch (err) {
        console.error(err);
      }

      setSignedInUser(null);
    }
  }, [userData]);

  return <>{children}</>;
}

export function Providers({
  cookiesStoreUserId,
  cookiesStoreAuthorizationToken,
  children,
}: Readonly<{
  children: React.ReactNode;
  cookiesStoreAuthorizationToken: string | undefined;
  cookiesStoreUserId: string | undefined;
}>) {
  const [signedInUser, setSignedInUser] = useState<TUser | null | undefined>();
  const cookies = useCookies();

  function signOut() {
    cookies.remove('user_id');
    cookies.remove('authorization_token');

    try {
      localStorage.removeItem('user_id');
      localStorage.removeItem('authorization_token');
    } catch (err) {
      console.error(err);
    }

    setSignedInUser(null);
  }

  return (
    <ThemeProvider attribute="class">
      <UserContext.Provider value={{ signedInUser, signOut }}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <LocalStorageProvider
            cookiesStoreAuthorizationToken={cookiesStoreAuthorizationToken}
            cookiesStoreUserId={cookiesStoreUserId}
            setSignedInUser={setSignedInUser}
          >
            {children}
          </LocalStorageProvider>
        </QueryClientProvider>
      </UserContext.Provider>
    </ThemeProvider>
  );
}
