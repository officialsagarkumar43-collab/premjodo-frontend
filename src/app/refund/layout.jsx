const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Refund Policy",
  description:
    "Official Prem Jodo refund policy and resolution processes.",
  alternates: {
    canonical: "/refund",
  },
  openGraph: {
    title: "Prem Jodo Refund Policy",
    description: "Official Refund Policy.",
    url: `${siteUrl}/refund`,
    siteName: "Prem Jodo",
    type: "website",
  },
};

export default function RefundLayout({ children }) {
  return <>{children}</>;
}
