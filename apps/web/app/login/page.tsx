'use client';

import { UserIcon } from '@heroicons/react/24/outline';
import { useContext } from 'react';

import { Button } from '../components';
import { UserContext } from '../context';
import GuestPage from '../guards/guest';

export default function LoginPage() {
  const { sessionExpired } = useContext(UserContext);

  return (
    <GuestPage>
      <div className="flex flex-col items-center justify-center grow p-6">
        <div className="w-100 max-w-full flex flex-col items-center p-6 gap-6 bg-black/10 dark:bg-white/10 rounded-md">
          <div className="flex flex-col gap-3 items-center">
            <UserIcon className="size-10" />
            <h1 className="text-lg font-bold text-center">Connexion</h1>
          </div>
          <span className="text-sm text-center">
            Connectez-vous avec votre compte Geovelo afin de visualiser votre activité vélo.
          </span>
          {sessionExpired && (
            <p className="text-sm text-center" role="alert">
              Votre session a expiré. Reconnectez-vous pour retrouver vos statistiques.
            </p>
          )}
          <Button href="/api/login" label="Se connecter avec Geovelo" />
        </div>
      </div>
    </GuestPage>
  );
}
