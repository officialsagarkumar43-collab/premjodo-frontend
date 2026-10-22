const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Singles Events, Mixers & Meetups in India",
  description:
    "Join verified singles events, sunset coffee mixers, acoustic music nights, sip & paint dates, and nationwide virtual lounges on Prem Jodo.",
  keywords: [
    "singles events mumbai",
    "singles mixer delhi",
    "speed dating bangalore",
    "singles meetup india",
    "prem jodo events",
    "offline dating mixer",
    "coffee dates singles",
  ],
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    title: "Prem Jodo Singles Events & Mixers",
    description:
      "Join curated singles mixers, sunset coffee meetups, and virtual speed dating for verified members.",
    url: `${siteUrl}/events`,
    siteName: "Prem Jodo",
    type: "website",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Prem Jodo Singles Events & Mixers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prem Jodo Singles Events & Mixers",
    description:
      "Curated real-life singles mixers, art dates, and virtual speed dating.",
    images: ["/images/og-cover.png"],
  },
};

const jsonLdEvents = {
  "@context": "https://schema.org",
  "@type": "EventSeries",
  name: "Prem Jodo Singles Mixers & Social Events",
  description:
    "Curated singles events, coffee mixers, and speed networking sessions for verified members across India.",
  organizer: {
    "@type": "Organization",
    name: "Prem Jodo",
    url: siteUrl,
  },
  eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
  location: [
    {
      "@type": "Place",
      name: "Bandra West, Mumbai",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Mumbai",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
    },
    {
      "@type": "Place",
      name: "Indiranagar, Bengaluru",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
    },
    {
      "@type": "Place",
      name: "Hauz Khas Village, New Delhi",
      address: {
        "@type": "PostalAddress",
        addressLocality: "New Delhi",
        addressRegion: "Delhi",
        addressCountry: "IN",
      },
    },
  ],
};

export default function EventsLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdEvents),
        }}
      />
      {children}
    </>
  );
}
