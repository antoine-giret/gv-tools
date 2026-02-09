export class HttpService {
  static authorizationToken: string | null = null;

  static async _fetch<T extends object>({
    method,
    apiVersion,
    endpoint,
    queryParams,
  }: {
    apiVersion: number;
    endpoint: string;
    method: 'GET';
    queryParams?: Array<{ key: string; value: string }>;
  }): Promise<T> {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_GV_BACKEND_URL}/api/v${apiVersion}${endpoint}${queryParams ? `?${queryParams.map(({ key, value }) => [key, value].join('=')).join('&')}` : ''}`,
      {
        method,
        headers: {
          'Api-Key': process.env.NEXT_PUBLIC_GV_API_KEY || '',
          source: process.env.NEXT_PUBLIC_GV_SOURCE || '',
          Authorization: `Token ${this.authorizationToken}`,
        },
      },
    );

    if (method === 'GET' && res.status === 200) return res.json();

    throw new Error(res.statusText);
  }

  static async get<T extends object>({
    apiVersion,
    endpoint,
    queryParams,
  }: {
    apiVersion: number;
    endpoint: string;
    queryParams?: Array<{ key: string; value: string }>;
  }) {
    return this._fetch<T>({ method: 'GET', apiVersion, endpoint, queryParams });
  }
}
