const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Movie Ticket Booking & Cinema Date Nights",
  description:
    "Integrated cinema multiplex movie ticket booking service on Prem Jodo. Seamless digital seat selection, verified QR e-tickets, and transparent billing.",
  keywords: [
    "movie ticket booking",
    "couple movie date tickets",
    "cinema multiplex ticketing",
    "prem jodo movie booking",
    "theater ticket booking india",
  ],
  alternates: {
    canonical: "/movies",
  },
  openGraph: {
    title: "Prem Jodo Movie Booking - Cinema Date Nights",
    description:
      "Book movie tickets with authorized cinema multiplex partners across India with instant verified e-tickets.",
    url: `${siteUrl}/movies`,
    siteName: "Prem Jodo",
    type: "website",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Prem Jodo Movie Booking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prem Jodo Movie Booking Services",
    description: "Authorized digital movie ticketing and cinema reservations.",
    images: ["/images/og-cover.png"],
  },
};

const jsonLdMovies = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Prem Jodo Movie Booking Services",
  serviceType: "Entertainment & Cinema Ticketing",
  provider: {
    "@type": "Organization",
    name: "Prem Jodo",
    url: siteUrl,
  },
  description:
    "Authorized cinema multiplex movie ticket reservations, seat selection, and digital e-ticketing.",
};

export default function MoviesLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdMovies),
        }}
      />
      {children}
    </>
  );
}
