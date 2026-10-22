const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  title: "Movie Booking & Cinema Date Reservations",
  description:
    "Official Prem Jodo movie ticketing portal. Book seats across multiplex partner theaters with instant QR code ticketing.",
  keywords: [
    "movie booking",
    "cinema reservations",
    "date movie tickets",
    "prem jodo movie tickets",
  ],
  alternates: {
    canonical: "/movie-booking",
  },
  openGraph: {
    title: "Prem Jodo Movie Booking Portal",
    description: "Book movie tickets across authorized cinema partners.",
    url: `${siteUrl}/movie-booking`,
    siteName: "Prem Jodo",
    type: "website",
  },
};

export default function MovieBookingLayout({ children }) {
  return <>{children}</>;
}
