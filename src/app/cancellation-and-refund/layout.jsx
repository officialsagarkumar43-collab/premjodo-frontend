const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Cancellation and Refund Policy",
  description:
    "Official Prem Jodo cancellation and refund terms.",
  alternates: {
    canonical: "/cancellation-and-refund",
  },
  openGraph: {
    title: "Prem Jodo Cancellation & Refund Policy",
    description: "Official cancellation and refund policy.",
    url: `${siteUrl}/cancellation-and-refund`,
    siteName: "Prem Jodo",
    type: "website",
  },
};

export default function CancellationAndRefundLayout({ children }) {
  return <>{children}</>;
}
