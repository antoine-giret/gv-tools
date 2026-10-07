import { UserIcon } from '@heroicons/react/24/outline';

import { Button } from '../components';
import GuestPage from '../guards/guest';

export default function LoginPage() {
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
          <Button href="/api/login" label="Se connecter avec Geovelo" />
        </div>
      </div>
    </GuestPage>
  );
}
