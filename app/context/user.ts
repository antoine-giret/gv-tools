import { createContext } from 'react';
import { TUser } from '../models/user';

export const UserContext = createContext<{
  setUser: (user: TUser | null) => void;
  signedInUser: TUser | null | undefined;
}
>({
  signedInUser: null,
  setUser: () => undefined,
});
