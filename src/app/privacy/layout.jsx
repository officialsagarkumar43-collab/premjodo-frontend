const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Privacy Policy & Data Protection",
  description:
    "Learn how Prem Jodo collects, safeguards, and handles personal data and communications in strict compliance with the Indian Information Technology Act, 2000 and DPDP Act.",
  keywords: [
    "privacy policy",
    "dating data protection",
    "prem jodo privacy",
    "user data security",
  ],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Prem Jodo Privacy Policy",
    description: "Read our comprehensive privacy policy and data governance practices.",
    url: `${siteUrl}/privacy`,
    siteName: "Prem Jodo",
    type: "website",
  },
};

export default function PrivacyLayout({ children }) {
  return <>{children}</>;
}
