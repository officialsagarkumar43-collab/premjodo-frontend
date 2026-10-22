const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Safety Center & Member Dating Guidelines",
  description:
    "Safety first on Prem Jodo. Discover our photo verification standards, anti-fraud AI protections, in-person date safety tips, and grievance reporting.",
  keywords: [
    "online dating safety",
    "dating safety guidelines",
    "verified profiles safety",
    "safe meeting tips",
    "prem jodo safety center",
    "anti scam dating",
  ],
  alternates: {
    canonical: "/safety",
  },
  openGraph: {
    title: "Prem Jodo Safety Center & Guidelines",
    description:
      "Essential guidelines and safety protections for safe, trustworthy matchmaking.",
    url: `${siteUrl}/safety`,
    siteName: "Prem Jodo",
    type: "website",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Prem Jodo Safety Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prem Jodo Safety Center & Guidelines",
    description: "Learn how we keep your identity and dates safe on Prem Jodo.",
    images: ["/images/og-cover.png"],
  },
};

export default function SafetyLayout({ children }) {
  return <>{children}</>;
}
