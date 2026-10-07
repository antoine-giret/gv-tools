import { useQuery } from '@tanstack/react-query';

export function useUser(
  authData: {
    authorizationToken: string;
    userId: number;
  } | null,
) {
  return useQuery({
    queryKey: ['user', authData?.userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${authData?.userId}`);

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
