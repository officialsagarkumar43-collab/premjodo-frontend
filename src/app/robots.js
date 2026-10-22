export const dynamic = 'force-static';

export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://premjodo.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/user/',
          '/user/*',
          '/auth/',
          '/auth/*',
          '/onboarding',
          '/onboarding/*',
          '/api/',
          '/api/*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/user/',
          '/user/*',
          '/auth/',
          '/auth/*',
          '/onboarding',
          '/onboarding/*',
          '/api/',
          '/api/*',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
