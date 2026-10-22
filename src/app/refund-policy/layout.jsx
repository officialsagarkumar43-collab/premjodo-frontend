const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Cancellation & Refund Policy",
  description:
    "Review Prem Jodo official refund and cancellation terms for digital subscriptions, event reservations, and store merchandise purchases.",
  keywords: [
    "refund policy",
    "cancellation policy",
    "dating app refund",
    "prem jodo refund policy",
  ],
  alternates: {
    canonical: "/refund-policy",
  },
  openGraph: {
    title: "Prem Jodo Cancellation & Refund Policy",
    description: "Official cancellation and refund terms and guidelines.",
    url: `${siteUrl}/refund-policy`,
    siteName: "Prem Jodo",
    type: "website",
  },
};

export default function RefundPolicyLayout({ children }) {
  return <>{children}</>;
}
