const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Terms of Service & User Agreement",
  description:
    "Review Prem Jodo Terms of Service, member eligibility guidelines, code of conduct, and statutory legal agreement.",
  keywords: [
    "terms of service",
    "user agreement",
    "dating app terms",
    "prem jodo terms",
  ],
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Prem Jodo Terms of Service",
    description: "Official user agreement and terms of platform use.",
    url: `${siteUrl}/terms`,
    siteName: "Prem Jodo",
    type: "website",
  },
};

export default function TermsLayout({ children }) {
  return <>{children}</>;
}
