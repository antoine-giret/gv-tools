'use client';

import { useCallback, useState } from 'react';

type TAdminUser = {
  id: number;
  geoveloId: string;
  username: string | null;
  profilePicture: string | null;
  createdAt: string | null;
  sessionCount: number;
};

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<TAdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (path: string, init?: RequestInit) =>
      fetch(`/api/admin/users${path}`, {
        ...init,
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          'Content-Type': 'application/json',
        },
      }),
    [username, password],
  );

  const load = useCallback(async () => {
    const response = await request('');

    if (!response.ok) {
      setUsers(null);
      setError('Accès refusé');

      return;
    }

    setError(null);
    setUsers((await response.json()) as TAdminUser[]);
  }, [request]);

  async function act(path: string, init: RequestInit) {
    await request(path, init);
    await load();
  }

  if (!users) {
    return (
      <form
        className="flex flex-col items-center justify-center grow p-6 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <h1 className="text-lg font-bold">Administration</h1>
        <input
          className="border rounded-md p-2"
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nom d'utilisateur"
          value={username}
        />
        <input
          className="border rounded-md p-2"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          type="password"
          value={password}
        />
        {error && <span className="text-sm text-red-500">{error}</span>}
        <button className="border rounded-md px-3 py-1" type="submit">
          Entrer
        </button>
      </form>
    );
  }

  return (
    <div className="p-6 overflow-auto">
      <h1 className="text-lg font-bold mb-4">Utilisateurs ({users.length})</h1>
      <table className="text-sm w-full text-left">
        <thead>
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Geovelo ID</th>
            <th className="p-2">Nom</th>
            <th className="p-2">Création</th>
            <th className="p-2">Sessions</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr className="border-t" key={user.id}>
              <td className="p-2">{user.id}</td>
              <td className="p-2">{user.geoveloId}</td>
              <td className="p-2">{user.username}</td>
              <td className="p-2">{user.createdAt}</td>
              <td className="p-2">{user.sessionCount}</td>
              <td className="p-2 flex gap-2">
                <button
                  className="underline"
                  onClick={() => {
                    const username = prompt('Nouveau nom', user.username ?? '');

                    if (username !== null)
                      void act(`/${user.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ username }),
                      });
                  }}
                >
                  Renommer
                </button>
                <button
                  className="underline"
                  onClick={() => void act(`/${user.id}?sessions=1`, { method: 'DELETE' })}
                >
                  Révoquer sessions
                </button>
                <button
                  className="underline text-red-500"
                  onClick={() => {
                    if (confirm(`Supprimer ${user.username ?? user.geoveloId} ?`))
                      void act(`/${user.id}`, { method: 'DELETE' });
                  }}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
