'use client';

import { TUser } from '@repo/models';
import { HttpService, UserService } from '@repo/services';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';

import { UserContext } from './context';

export function Providers({
  cookiesStoreUserId,
  cookiesStoreAuthorizationToken,
  children,
}: Readonly<{
  children: React.ReactNode;
  cookiesStoreAuthorizationToken: string | undefined;
  cookiesStoreUserId: string | undefined;
}>) {
  const [signedInUser, setUser] = useState<TUser | null>();

  useEffect(() => {
    async function getUser() {
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

      if (userId && !Number.isNaN(userId) && authorizationToken) {
        HttpService.authorizationToken = authorizationToken;

        try {
          const { id, username, profile_picture } = await UserService.fetchUser<{
            id: number;
            username: string;
            profile_picture: string | null;
          }>({ userId });

          try {
            localStorage.setItem('user_id', `${userId}`);
            localStorage.setItem('authorization_token', authorizationToken);
          } catch (err) {
            console.error(err);
          }

          setUser({
            id,
            username,
            profilePicture: profile_picture
              ? `${process.env.NEXT_PUBLIC_GV_BACKEND_URL}${profile_picture}`
              : null,
          });
        } catch (err) {
          HttpService.authorizationToken = null;
          console.error('cannot fetch user', err);

          try {
            localStorage.removeItem('user_id');
            localStorage.removeItem('authorization_token');
          } catch (err) {
            console.error(err);
          }

          setUser(null);
        }
      } else {
        try {
          localStorage.removeItem('user_id');
          localStorage.removeItem('authorization_token');
        } catch (err) {
          console.error(err);
        }
      }
    }

    getUser();
  }, []);

  return (
    <ThemeProvider attribute="class">
      <UserContext.Provider value={{ signedInUser, setUser }}>{children}</UserContext.Provider>
    </ThemeProvider>
  );
}
