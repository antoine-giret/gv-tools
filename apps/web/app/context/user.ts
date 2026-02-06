import { TUser } from '@repo/models';
import { createContext } from 'react';

export const UserContext = createContext<{
  setUser: (user: TUser | null) => void;
  signedInUser: TUser | null | undefined;
}>({
  signedInUser: null,
  setUser: () => undefined,
});
