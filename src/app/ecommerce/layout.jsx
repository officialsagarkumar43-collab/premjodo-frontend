const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Official Store & Curated Date Gifts",
  description:
    "Explore the official Prem Jodo Store. Discover curated lifestyle products, date night celebration hampers, authentic branded merchandise, and gift sets.",
  keywords: [
    "prem jodo store",
    "dating gifts india",
    "date night hampers",
    "couple merchandise",
    "lifestyle store prem jodo",
    "anniversary gifts",
  ],
  alternates: {
    canonical: "/ecommerce",
  },
  openGraph: {
    title: "Prem Jodo Official Ecommerce & Gifts Store",
    description:
      "Curated lifestyle hampers, branded merchandise, and quality date celebration goods with reliable doorstep delivery.",
    url: `${siteUrl}/ecommerce`,
    siteName: "Prem Jodo",
    type: "website",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Prem Jodo Ecommerce Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prem Jodo Official Ecommerce Store",
    description: "Curated lifestyle products and gifts for special occasions.",
    images: ["/images/og-cover.png"],
  },
};

const jsonLdStore = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Prem Jodo Official Retail Store",
  description:
    "Official customer store for curated lifestyle collections, date hampers, and branded merchandise.",
  url: `${siteUrl}/ecommerce`,
  currenciesAccepted: "INR",
  paymentAccepted: "Credit Card, Debit Card, UPI, Net Banking",
};

export default function EcommerceLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdStore),
        }}
      />
      {children}
    </>
  );
}
