'use client';

import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useContext } from 'react';

import { IconButton, Tooltip } from '../components';
import { UserContext } from '../context';
import { useTracesSync, useTracesSyncProgress } from '../hooks/queries/use-traces-sync';

function TracesSyncStatus() {
  const { signedInUser } = useContext(UserContext);
  const { data: syncedAt, isFetching, isError } = useTracesSync(signedInUser);
  const { data: progress } = useTracesSyncProgress(signedInUser, isFetching);

  if (isFetching)
    return (
      <Tooltip
        label={`Synchronisation des traces…${progress?.pages ? ` (${Math.round((progress.page / progress.pages) * 100)}\u00a0%)` : ''}`}
        position="bottom"
      >
        <ArrowPathIcon
          aria-label="Synchronisation en cours"
          className="size-4 animate-spin text-black/50 dark:text-white/50"
        />
      </Tooltip>
    );

  if (isError)
    return (
      <Tooltip label="Échec de la synchronisation" position="bottom">
        <ExclamationTriangleIcon
          aria-label="Échec de la synchronisation"
          className="size-4 text-red-500"
        />
      </Tooltip>
    );

  if (!syncedAt) return null;

  return (
    <Tooltip
      label={`Synchronisé le ${syncedAt.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}`}
      position="bottom"
    >
      <CheckCircleIcon
        aria-label="Traces synchronisées"
        className="size-4 text-emerald-500 dark:text-emerald-300"
      />
    </Tooltip>
  );
}

export function Nav() {
  const { signedInUser, signOut } = useContext(UserContext);

  function handleSignOut() {
    signOut();
  }

  return (
    <div className="shrink-0 flex items-center gap-3">
      {signedInUser && (
        <>
          <div className="flex items-center gap-2">
            {signedInUser.profilePicture ? (
              <Image
                alt="Profile picture"
                height={24}
                src={signedInUser.profilePicture}
                style={{ borderRadius: 12 }}
                width={24}
              />
            ) : (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500">
                <UserIcon className="size-4" />
              </div>
            )}
            <span className="text-md">{signedInUser.username}</span>
            <TracesSyncStatus />
          </div>
          <Tooltip label="Se déconnecter" position="bottom-left">
            <IconButton
              Icon={ArrowRightStartOnRectangleIcon}
              label="Se déconnecter"
              onClick={handleSignOut}
            />
          </Tooltip>
        </>
      )}
    </div>
  );
}
