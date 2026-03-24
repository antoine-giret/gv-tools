import { TUser } from '@repo/models';
import { createContext } from 'react';

export const UserContext = createContext<{
  signOut: () => void;
  signedInUser: TUser | null | undefined;
}>({
  signedInUser: null,
  signOut: () => undefined,
});
