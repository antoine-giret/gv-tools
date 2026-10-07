import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mon activité vélo',
    short_name: 'Activité vélo',
    description: 'Visualisez votre activité vélo à partir de vos données Geovelo.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/pwa-round-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-round-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
