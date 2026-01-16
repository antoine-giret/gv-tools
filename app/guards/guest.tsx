'use client';

import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

import { UserContext } from '../context';

export default function GuestPage({ children }: { children: React.ReactNode; }) {
  const { signedInUser } = useContext(UserContext);

  useEffect(() => {
    if (signedInUser) redirect(`/dashboard/stats`);
  }, [signedInUser]);

  if (signedInUser) return <></>;

  return <>{children}</>;
}
