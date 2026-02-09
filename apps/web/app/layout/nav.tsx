'use client';

import { ArrowRightStartOnRectangleIcon, UserIcon } from '@heroicons/react/24/solid';
import { HttpService } from '@repo/services';
import Image from 'next/image';
import { useCookies } from 'next-client-cookies';
import { useContext } from 'react';

import { IconButton, Tooltip } from '../components';
import { UserContext } from '../context';

export function Nav() {
  const { signedInUser, setUser } = useContext(UserContext);
  const cookies = useCookies();

  function logout() {
    cookies.remove('user_id');
    cookies.remove('authorization_token');

    HttpService.authorizationToken = null;

    try {
      localStorage.removeItem('user_id');
      localStorage.removeItem('authorization_token');
    } catch (err) {
      console.error(err);
    }

    setUser(null);
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
          </div>
          <Tooltip label="Se déconnecter" position="bottom-left">
            <IconButton
              Icon={ArrowRightStartOnRectangleIcon}
              label="Se déconnecter"
              onClick={logout}
            />
          </Tooltip>
        </>
      )}
    </div>
  );
}
