export async function geoveloFetch<T>({
  endpoint,
  queryParams,
  method = 'GET',
  user,
}: {
  endpoint: string;
  queryParams?: Array<{ key: string; value: string }>;
  method?: 'GET';
  user?: { authorizationToken: string } | null;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_GV_BACKEND_URL}/api/${endpoint}${queryParams ? `?${queryParams.map(({ key, value }) => [key, value].join('=')).join('&')}` : ''}`,
    {
      method,
      headers: {
        'Api-Key': process.env.NEXT_PUBLIC_GV_API_KEY || '',
        source: process.env.NEXT_PUBLIC_GV_SOURCE || '',
        ...(user ? { Authorization: `Token ${user.authorizationToken}` } : {}),
      },
    },
  );

  return response.json() as T;
}
