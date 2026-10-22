const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Help Center & Frequently Asked Questions",
  description:
    "Find answers to frequently asked questions about Prem Jodo membership plans, photo verification, matchmaking, billing, and account safety.",
  keywords: [
    "prem jodo help center",
    "dating app faq",
    "prem jodo support",
    "account verification help",
    "subscription faq",
    "dating customer service",
  ],
  alternates: {
    canonical: "/support",
  },
  openGraph: {
    title: "Prem Jodo Help Center & Support",
    description:
      "Instant answers to questions regarding your account, matchmaking, safety, and payments.",
    url: `${siteUrl}/support`,
    siteName: "Prem Jodo",
    type: "website",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Prem Jodo Help Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prem Jodo Help Center & Support",
    description: "Browse FAQs and get answers to your questions.",
    images: ["/images/og-cover.png"],
  },
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does profile verification work on Prem Jodo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Members submit a real-time selfie matched against their gallery photos using biometric AI verification to receive a verified blue badge.",
      },
    },
    {
      "@type": "Question",
      name: "Are payments and transactions secure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, 100% secure. All payments are processed through RBI-authorized 256-bit encrypted secure payment gateways.",
      },
    },
    {
      "@type": "Question",
      name: "Can I cancel my subscription at any time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can cancel your subscription anytime directly from your profile settings or subscriptions page.",
      },
    },
  ],
};

export default function SupportLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdFaq),
        }}
      />
      {children}
    </>
  );
}
