const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Contact Us & Inquiries",
  description:
    "Get in touch with the Prem Jodo support and customer assistance team.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Prem Jodo",
    description: "Official customer contact and support channel.",
    url: `${siteUrl}/contact`,
    siteName: "Prem Jodo",
    type: "website",
  },
};

export default function ContactLayout({ children }) {
  return <>{children}</>;
}
