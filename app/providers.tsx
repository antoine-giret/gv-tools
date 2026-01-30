'use client';

import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';

import { UserContext } from './context';
import { TUser } from './models/user';

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_GV_BACKEND_URL}/api/v1/users/${userId}`, {
          method: 'GET',
          headers: {
            'Api-Key': process.env.NEXT_PUBLIC_GV_API_KEY || '',
            source: process.env.NEXT_PUBLIC_GV_SOURCE || '',
            Authorization: `Token ${authorizationToken}`,
          },
        });

        if (res.status === 200) {
          const { id, username, profile_picture } = await res.json();

          try {
            localStorage.setItem('user_id', `${userId}`);
            localStorage.setItem('authorization_token', authorizationToken);
          } catch (err) {
            console.error(err);
          }

          setUser({
            authorizationToken,
            id,
            username,
            profilePicture: profile_picture ? `${process.env.NEXT_PUBLIC_GV_BACKEND_URL}${profile_picture}` : null,
          });

          return;
        }
      }

      try {
        localStorage.removeItem('user_id');
        localStorage.removeItem('authorization_token');
      } catch (err) {
        console.error(err);
      }

      setUser(null);
    }

    getUser();
  }, []);

  return (
    <ThemeProvider attribute='class'>
      <UserContext.Provider value={{ signedInUser, setUser }}>
        {children}
      </UserContext.Provider>
    </ThemeProvider>
  );
}
