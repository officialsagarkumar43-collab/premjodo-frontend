const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Ecommerce Services & Customer Store",
  description:
    "Official customer retail merchandise, gifts, and lifestyle hampers by Prem Jodo.",
  keywords: [
    "ecommerce services",
    "customer store",
    "lifestyle products",
    "prem jodo shopping",
  ],
  alternates: {
    canonical: "/ecommerce-services",
  },
  openGraph: {
    title: "Prem Jodo Ecommerce Services",
    description: "Official merchandise and lifestyle retail products.",
    url: `${siteUrl}/ecommerce-services`,
    siteName: "Prem Jodo",
    type: "website",
  },
};

export default function EcommerceServicesLayout({ children }) {
  return <>{children}</>;
}
