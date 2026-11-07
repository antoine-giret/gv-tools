'use client';

import { redirect } from 'next/navigation';
import { useContext, useEffect } from 'react';

import { UserContext } from './context';

export default function Home() {
  const { signedInUser } = useContext(UserContext);

  useEffect(() => {
    if (signedInUser !== undefined) redirect(signedInUser ? '/dashboard/stats' : '/login');
  }, [signedInUser]);

  return <div className="grow" />;
}
