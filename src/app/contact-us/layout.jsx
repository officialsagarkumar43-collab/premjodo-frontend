const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Contact Us & Customer Support",
  description:
    "Have questions or need assistance? Reach out to the Prem Jodo team, customer care, partnerships desk, and statutory Grievance Officer.",
  keywords: [
    "contact prem jodo",
    "prem jodo support email",
    "customer care prem jodo",
    "grievance officer dating app",
    "prem jodo customer helpline",
  ],
  alternates: {
    canonical: "/contact-us",
  },
  openGraph: {
    title: "Contact Prem Jodo Team & Support",
    description:
      "Get in touch with Prem Jodo for customer help, corporate partnerships, and grievances.",
    url: `${siteUrl}/contact-us`,
    siteName: "Prem Jodo",
    type: "website",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Contact Prem Jodo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Prem Jodo Team & Support",
    description: "Get in touch with customer care and grievance support.",
    images: ["/images/og-cover.png"],
  },
};

const jsonLdContact = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact Prem Jodo",
  description: "Official contact page for customer support and inquiries.",
  url: `${siteUrl}/contact-us`,
  mainEntity: {
    "@type": "Organization",
    name: "Prem Jodo",
    url: siteUrl,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "officialsagarkumar43@gmail.com",
      telephone: "+91-9625477336",
      availableLanguage: ["English", "Hindi"],
    },
  },
};

export default function ContactUsLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdContact),
        }}
      />
      {children}
    </>
  );
}
