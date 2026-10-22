import { Poppins, Plus_Jakarta_Sans, Outfit, Roboto_Slab } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { GlobalCallListener } from "@/components/chat/GlobalCallListener";
import { ConsoleSilencer } from "@/components/common/ConsoleSilencer";
import GlobalBackground from "@/components/common/GlobalBackground";
import AnimatedCursor from "@/components/common/AnimatedCursor";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  variable: "--font-slab",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://premjodo.com";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Prem Jodo | Smart Matchmaking & Meaningful Connections",
    template: "%s | Prem Jodo",
  },
  description:
    "Connect, chat, and meet verified compatible members on Prem Jodo. Safe, transparent, and authentic matchmaking platform for meaningful dating and life partners.",
  keywords: [
    "dating app india",
    "matchmaking platform",
    "find life partner",
    "verified profiles dating",
    "singles events india",
    "prem jodo",
    "matrimony and dating",
    "safe online dating",
  ],
  authors: [{ name: "Prem Jodo Team", url: siteUrl }],
  creator: "Prem Jodo",
  publisher: "Prem Jodo",
  applicationName: "Prem Jodo",
  category: "Lifestyle / Matchmaking",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Prem Jodo | Smart Matchmaking & Meaningful Connections",
    description:
      "Connect, chat, and meet verified compatible members on Prem Jodo. Safe, transparent, and authentic matchmaking platform.",
    url: siteUrl,
    siteName: "Prem Jodo",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Prem Jodo - Smart Matchmaking Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prem Jodo | Smart Matchmaking & Meaningful Connections",
    description:
      "Connect, chat, and meet verified compatible members on Prem Jodo. Safe, transparent, and authentic matchmaking platform.",
    images: ["/images/og-cover.png"],
    creator: "@premjodo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const jsonLdOrgAndWebSite = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Prem Jodo",
      url: siteUrl,
      logo: `${siteUrl}/icon-512x512.png`,
      image: `${siteUrl}/icon-512x512.png`,
      sameAs: [
        "https://www.facebook.com/premjodo",
        "https://www.instagram.com/premjodo",
        "https://twitter.com/premjodo",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        email: "officialsagarkumar43@gmail.com",
        telephone: "+91-9625477336",
        availableLanguage: ["English", "Hindi"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Prem Jodo",
      description: "Smart Matchmaking & Meaningful Connections Platform",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      inLanguage: "en-IN",
    },
  ],
};

import { MobileBottomNav } from "@/components/common/MobileBottomNav";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${robotoSlab.variable} ${plusJakarta.variable} ${outfit.variable} antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("prem_jodo_theme");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var isDark=t==="dark"||(t==="system"&&d);if(isDark){document.documentElement.classList.add("dark");document.documentElement.setAttribute("data-theme","dark");document.documentElement.style.colorScheme="dark";}else{document.documentElement.classList.remove("dark");document.documentElement.setAttribute("data-theme","light");document.documentElement.style.colorScheme="light";}}catch(e){}})();`,
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdOrgAndWebSite),
          }}
        />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <ConsoleSilencer />
              <GlobalBackground />
              <AnimatedCursor />
              {children}
              <MobileBottomNav />
              <GlobalCallListener />
              <ScrollToTop />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
