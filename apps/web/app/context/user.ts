import { TUser } from '@repo/models';
import { createContext } from 'react';

export const UserContext = createContext<{
  signOut: () => void;
  signedInUser: TUser | null | undefined;
  sessionExpired: boolean;
}>({
  signedInUser: null,
  sessionExpired: false,
  signOut: () => undefined,
});
