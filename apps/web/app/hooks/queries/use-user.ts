import { useQuery } from '@tanstack/react-query';

import { geoveloFetch } from '../../utils/fetcher';

export function useUser(
  authData: {
    authorizationToken: string;
    userId: number;
  } | null,
) {
  return useQuery({
    queryKey: ['user', authData?.userId],
    queryFn: async () => {
      return geoveloFetch<{
        id: number;
        username: string;
        profile_picture: string | null;
      }>({
        endpoint: `/v1/users/${authData?.userId}`,
        user: authData,
      });
    },
    enabled: !!authData,
  });
}
