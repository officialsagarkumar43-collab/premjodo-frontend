const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Membership Plans & VIP Pricing",
  description:
    "Upgrade to Prem Jodo Plus, Gold, or Platinum. Unlock unlimited swipes, instant rewind, priority likes, profile spotlight boosts, and verified badges.",
  keywords: [
    "prem jodo subscription",
    "dating app pricing",
    "prem jodo gold plan",
    "prem jodo platinum membership",
    "premium matchmaking subscription",
    "unlimited swipes dating app",
  ],
  alternates: {
    canonical: "/subscriptions",
  },
  openGraph: {
    title: "Prem Jodo Membership Plans & VIP Pricing",
    description:
      "Unlock unlimited swipes, priority likes, profile boosts, and verified VIP status with transparent plans.",
    url: `${siteUrl}/subscriptions`,
    siteName: "Prem Jodo",
    type: "website",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Prem Jodo Memberships",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prem Jodo Membership Plans & VIP Pricing",
    description:
      "Explore Plus, Gold, and Platinum premium plans on Prem Jodo.",
    images: ["/images/og-cover.png"],
  },
};

const jsonLdSubscriptions = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Prem Jodo VIP Membership",
  description:
    "Premium matchmaking tiers providing unlimited swipes, verified badges, profile boosts, and priority matching.",
  brand: {
    "@type": "Brand",
    name: "Prem Jodo",
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "INR",
    lowPrice: "199",
    highPrice: "1999",
    offerCount: "3",
  },
};

export default function SubscriptionsLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSubscriptions),
        }}
      />
      {children}
    </>
  );
}
