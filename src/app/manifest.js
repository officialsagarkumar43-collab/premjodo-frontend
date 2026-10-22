export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: 'Prem Jodo - Smart Matchmaking & Connections',
    short_name: 'Prem Jodo',
    description: 'Find meaningful relationships and authentic matchmaking on Prem Jodo.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#e11d48',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any',
      },
    ],
  };
}
