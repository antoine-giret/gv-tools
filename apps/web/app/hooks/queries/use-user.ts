import { useQuery } from '@tanstack/react-query';

import { fetchApi } from '../../utils/fetch-api';

export function useUser(
  authData: {
    authorizationToken: string;
    userId: number;
  } | null,
) {
  return useQuery({
    queryKey: ['user', authData?.userId],
    queryFn: async () => {
      const response = await fetchApi(`/api/users/${authData?.userId}`);

      return response.json() as Promise<{
        id: number;
        username: string;
        profile_picture: string | null;
        created: string;
      }>;
    },
    enabled: !!authData,
  });
}
