const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Terms and Conditions",
  description:
    "Official terms and conditions governing access, memberships, and services on Prem Jodo.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title: "Prem Jodo Terms and Conditions",
    description: "Terms and conditions for Prem Jodo.",
    url: `${siteUrl}/terms-and-conditions`,
    siteName: "Prem Jodo",
    type: "website",
  },
};

export default function TermsAndConditionsLayout({ children }) {
  return <>{children}</>;
}
