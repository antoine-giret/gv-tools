'use client';

import { TUser } from '@repo/models';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useCookies } from 'next-client-cookies';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';

import { UserContext } from './context';
import { useUser } from './hooks/queries/use-user';
import { ApiError } from './utils/fetch-api';

function UserProvider({
  authData,
  children,
  setSignedInUser,
  signOut,
}: Readonly<{
  authData: { userId: number; authorizationToken: string } | null;
  children: React.ReactNode;
  setSignedInUser: (user: TUser | null) => void;
  signOut: () => void;
}>) {
  const { data: userData, isError, refetch } = useUser(authData);

  useEffect(() => {
    if (userData && authData) {
      const { id, username, profile_picture, created } = userData;
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
        created: new Date(created),
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
  }, [userData, authData, setSignedInUser]);

  if (authData && isError && !userData)
    return (
      <div className="flex flex-col items-center gap-3 p-6 text-center" role="alert">
        <p>
          Impossible de vérifier votre connexion. Vérifiez votre connexion internet et réessayez.
        </p>
        <div className="flex gap-3">
          <button className="underline" onClick={() => void refetch()}>
            Réessayer
          </button>
          <button className="underline" onClick={signOut}>
            Se déconnecter
          </button>
        </div>
      </div>
    );

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
  const [sessionExpired, setSessionExpired] = useState(false);
  const cookies = useCookies();
  const [authData, setAuthData] = useState(() => {
    let userId = cookiesStoreUserId;
    let authorizationToken = cookiesStoreAuthorizationToken;

    if (!userId && typeof window !== 'undefined') {
      try {
        userId = localStorage.getItem('user_id') ?? undefined;
        authorizationToken = localStorage.getItem('authorization_token') ?? undefined;
      } catch (err) {
        console.error(err);
      }
    }

    const parsedUserId = Number(userId);
    return parsedUserId && Number.isInteger(parsedUserId) && authorizationToken
      ? { userId: parsedUserId, authorizationToken }
      : null;
  });

  function clearSession(expired: boolean) {
    cookies.remove('user_id');
    cookies.remove('authorization_token');

    try {
      localStorage.removeItem('user_id');
      localStorage.removeItem('authorization_token');
    } catch (err) {
      console.error(err);
    }

    setAuthData(null);
    setSignedInUser(null);
    setSessionExpired(expired);
  }

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof ApiError && error.status === 401) clearSession(true);
          },
        }),
        defaultOptions: {
          queries: {
            retry: (failureCount, error) =>
              !(error instanceof ApiError && error.status === 401) && failureCount < 3,
          },
        },
      }),
  );

  function signOut() {
    clearSession(false);
    queryClient.clear();
  }

  return (
    <ThemeProvider attribute="class">
      <UserContext.Provider value={{ signedInUser, sessionExpired, signOut: () => signOut() }}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <UserProvider
            authData={authData}
            setSignedInUser={setSignedInUser}
            signOut={() => signOut()}
          >
            {children}
          </UserProvider>
        </QueryClientProvider>
      </UserContext.Provider>
    </ThemeProvider>
  );
}
