const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "App Features & Smart Matchmaking Technology",
  description:
    "Explore Prem Jodo features: verified member profiles, smart compatibility scoring, interactive date battles, high-fidelity voice/video calling, and total privacy controls.",
  keywords: [
    "dating app features",
    "smart matchmaking algorithm",
    "verified profiles",
    "safe video dating",
    "dating app india features",
    "prem jodo matchmaking",
  ],
  alternates: {
    canonical: "/product",
  },
  openGraph: {
    title: "Prem Jodo - Features & Matchmaking Technology",
    description:
      "Intelligent matchmaking, verified profiles, live interactive battles, and safe in-app communications.",
    url: `${siteUrl}/product`,
    siteName: "Prem Jodo",
    type: "website",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Prem Jodo Features",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prem Jodo - Features & Matchmaking Technology",
    description:
      "Explore verified profile matching, real-time video dates, and smart chemistry quizzes on Prem Jodo.",
    images: ["/images/og-cover.png"],
  },
};

const jsonLdProduct = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Prem Jodo",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web, Android, iOS",
  description:
    "Intelligent matchmaking, verified member profiles, live audio/video dating, and personality compatibility discovery.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
};

export default function ProductLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdProduct),
        }}
      />
      {children}
    </>
  );
}
