const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Safety Tips & Best Practices for Dating",
  description:
    "Practical safety advice for connecting online, meeting for first dates in public, protecting your financial details, and staying secure.",
  keywords: [
    "safety tips",
    "first date safety",
    "online dating precautions",
    "prem jodo safety tips",
  ],
  alternates: {
    canonical: "/safety-tips",
  },
  openGraph: {
    title: "Prem Jodo Dating Safety Tips",
    description: "Best practices and advice for safe online and in-person dating.",
    url: `${siteUrl}/safety-tips`,
    siteName: "Prem Jodo",
    type: "website",
  },
};

export default function SafetyTipsLayout({ children }) {
  return <>{children}</>;
}
