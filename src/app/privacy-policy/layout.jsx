const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Official Privacy Policy detailing data collection, storage, and privacy rights on Prem Jodo.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Prem Jodo Privacy Policy",
    description: "Official Privacy Policy.",
    url: `${siteUrl}/privacy-policy`,
    siteName: "Prem Jodo",
    type: "website",
  },
};

export default function PrivacyPolicyLayout({ children }) {
  return <>{children}</>;
}
