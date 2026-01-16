'use client';

import { ThemeProvider } from 'next-themes';
import { useState } from 'react';

import { UserContext } from './context';
import { TUser } from './models/user';

export function Providers({
  children,
  user,
}: Readonly<{
  children: React.ReactNode;
  user: TUser | null;
}>) {
  const [signedInUser, setUser] = useState(user);

  return (
    <ThemeProvider attribute='class'>
      <UserContext.Provider value={{ signedInUser, setUser }}>
        {children}
      </UserContext.Provider>
    </ThemeProvider>
  );
}
