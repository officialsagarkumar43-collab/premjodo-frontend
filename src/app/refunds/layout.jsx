const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Refunds Policy | Prem Jodo",
  description:
    "When Prem Jodo issues refunds for subscriptions and coins, how to request one, and why you should contact us before starting a chargeback.",
  keywords: [
    "refund policy",
    "refunds",
    "dating app refund",
    "prem jodo refund policy",
  ],
  alternates: {
    canonical: "/refunds",
  },
  openGraph: {
    title: "Prem Jodo Refunds Policy",
    description: "Official refunds terms and guidelines.",
    url: `${siteUrl}/refunds`,
    siteName: "Prem Jodo",
    type: "website",
  },
};

export default function RefundsLayout({ children }) {
  return <>{children}</>;
}
