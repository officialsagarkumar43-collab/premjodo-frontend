export const metadata = {
  title: "Free Online Chat & Random Chat Rooms | 1v1 Anonymous Stranger Text Chat",
  description:
    "Join free online chat rooms and instant random 1v1 text chat on Prem Jodo. Connect with strangers anonymously without login or registration. Safe, fast, Indian & global chat rooms. Start chatting now!",
  keywords: [
    "online chat",
    "free online chat",
    "chat room",
    "chat rooms",
    "chat room free",
    "chat rooms free",
    "online chat room",
    "online chat rooms",
    "random chat",
    "random chat room",
    "random chat rooms",
    "random text chat",
    "chat with strangers",
    "talk to strangers",
    "talk with strangers",
    "talk with strangers online",
    "anonymous chat",
    "anonymous chat room",
    "anonymous chat rooms",
    "anonymous text chat",
    "anonymous random chat",
    "1v1 chat",
    "1v1 text chat",
    "1-on-1 chat",
    "stranger chat",
    "stranger chat online",
    "stranger text chat",
    "stranger chat app",
    "free chat without registration",
    "free chat without login",
    "online chat without login",
    "chat online free",
    "free random chat",
    "live chat room",
    "live chat rooms",
    "live online chat",
    "meet strangers online",
    "make friends online chat",
    "indian chat room",
    "indian chat rooms",
    "free indian online chat",
    "desi chat room",
    "desi chat rooms",
    "chatroulette alternative",
    "omegle alternative text chat",
    "omegle text chat",
    "chitchat online",
    "guest chat",
    "private chat room",
    "private chat rooms",
    "single chat rooms",
    "friendship chat room",
    "dating chat room",
    "safe chat rooms",
    "text chat with strangers",
    "random stranger chat",
    "online chatting site",
    "best chat rooms",
    "instant chat room",
    "strangers chat online free",
    "chat with girls online free",
    "chat with boys online",
    "stranger chatting website",
    "online text chat rooms",
    "free anonymous chat site",
    "prem jodo chat",
    "prem jodo random chat",
  ],
  alternates: {
    canonical: "/text-chat",
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
  openGraph: {
    title: "Free Online Chat & Random Chat Rooms | Anonymous 1v1 Text Chat",
    description:
      "Instant 1v1 random text chat with strangers. Free online chat rooms with 100% anonymity, no sign-up or registration needed.",
    url: "https://premjodo.com/text-chat",
    siteName: "Prem Jodo",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "Free Online Chat Rooms & Random Stranger Text Chat - Prem Jodo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Chat & Random Chat Rooms | Prem Jodo",
    description:
      "Instant random 1v1 text chat with strangers. 100% anonymous, no registration required.",
    images: ["/images/og-cover.png"],
    creator: "@premjodo",
  },
  other: {
    subject: "Free Online Chat and Random Anonymous Chat Rooms",
    topic: "Online Chat, Chat Rooms, Stranger Chat, Random Text Chat",
    classification: "Online Chat / Communication / Social",
    abstract:
      "Free online chat rooms and anonymous 1v1 random text chat with strangers. No login or registration required.",
    "page-topic": "Online Chat Rooms",
    target: "all",
  },
};

export default function TextChatLayout({ children }) {
  const jsonLdWebPage = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Prem Jodo Free Online Chat & Random Chat Rooms",
    "url": "https://premjodo.com/text-chat",
    "applicationCategory": "CommunicationApplication",
    "operatingSystem": "All",
    "description":
      "Free online chat rooms and anonymous 1v1 random text chat. Connect with strangers globally and across India with zero registration required.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
    },
    "featureList": [
      "100% Anonymous 1v1 Chat",
      "No Login or Registration Required",
      "Real-time Text Messaging with Typing Indicators",
      "Instant Next Partner Skip (Esc)",
      "Dedicated Private Rooms",
      "Safe and Moderated Environment",
    ],
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does free online chat on Prem Jodo work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Prem Jodo free online chat connects two strangers in a private 1-on-1 random text chat room instantly. No registration, email, or login is required.",
        },
      },
      {
        "@type": "Question",
        "name": "Is this random chat room completely anonymous?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Yes! You are completely anonymous. Both you and your partner appear as 'Anonymous', and no personal details or identities are shared.",
        },
      },
      {
        "@type": "Question",
        "name": "Can I skip or change my chat partner?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Yes, you can click the 'Next Partner' button or press the Escape (Esc) key anytime to instantly disconnect and match with a new random stranger.",
        },
      },
      {
        "@type": "Question",
        "name": "Is Prem Jodo online chat free for users in India and worldwide?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Yes, Prem Jodo random online text chat is 100% free with unlimited chat sessions for users in India and worldwide.",
        },
      },
      {
        "@type": "Question",
        "name": "Do I need to download any app to use the chat rooms?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "No download or installation is required. You can use the chat rooms directly in any web browser on mobile or desktop.",
        },
      },
    ],
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://premjodo.com",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Online Chat Rooms",
        "item": "https://premjodo.com/text-chat",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      {children}
    </>
  );
}
