const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Download Prem Jodo App for Android & iOS",
  description:
    "Download the official Prem Jodo matchmaking app for Android and iOS. Connect with verified singles on the go, match by compatibility, and chat in real-time.",
  keywords: [
    "download prem jodo app",
    "prem jodo android app",
    "prem jodo ios app",
    "dating app download india",
    "prem jodo apk",
  ],
  alternates: {
    canonical: "/download",
  },
  openGraph: {
    title: "Download Prem Jodo App - Android & iOS",
    description:
      "Get the fastest-growing authentic Indian matchmaking and dating app on your smartphone.",
    url: `${siteUrl}/download`,
    siteName: "Prem Jodo",
    type: "website",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Download Prem Jodo App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Download Prem Jodo App - Android & iOS",
    description: "Install the Prem Jodo mobile app for Android and iOS.",
    images: ["/images/og-cover.png"],
  },
};

const jsonLdDownload = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Prem Jodo",
  operatingSystem: "Android, iOS",
  applicationCategory: "LifestyleApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
};

export default function DownloadLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdDownload),
        }}
      />
      {children}
    </>
  );
}
