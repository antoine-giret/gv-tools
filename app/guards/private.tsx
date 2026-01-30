'use client';

import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

import { UserContext } from '../context';

export default function PrivatePage({ children }: { children: React.ReactNode; }) {
  const { signedInUser } = useContext(UserContext);

  useEffect(() => {
    if (signedInUser === null) redirect(`/login`);
  }, [signedInUser]);

  if (!signedInUser) return <></>;

  return <>{children}</>;
}
