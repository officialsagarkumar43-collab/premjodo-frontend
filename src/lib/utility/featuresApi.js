/**
 * Utility / Configuration Layer for Landing Feature Cards
 * -------------------------------------------------------------
 * Static feature cards configuration rendered purely on the frontend.
 */

export const defaultFeatureCards = [
  {
    id: "f1",
    titleKey: "features.f1_title",
    descKey: "features.f1_desc",
    fallbackTitle: "Smart Compatibility Matching",
    fallbackDesc: "Discover compatible singles nearby based on shared values, interests, and relationship goals.",
    image: "/images/features/feat-smart-match.jpg",
    imageAlt: "Smart Compatibility Matching Couple in Cafe",
    iconName: "HeartHandshake",
    theme: "rose",
    badgeKey: "Genuine Vibe",
    accentGlow: "from-rose-500/20 via-rose-500/10 to-transparent",
    iconBg: "bg-rose-50 text-rose-600 border border-rose-100 shadow-sm shadow-rose-500/10 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/20",
    borderHover: "hover:border-rose-400 dark:hover:border-rose-500/50 hover:shadow-rose-500/10",
  },
  {
    id: "f2",
    titleKey: "features.f2_title",
    descKey: "features.f2_desc",
    fallbackTitle: "100% Verified Profiles",
    fallbackDesc: "100% authentic members. Our AI selfie verification ensures you only meet genuine people.",
    image: "/images/features/feat-verified-profile.jpg",
    imageAlt: "100% Verified Member with Authenticity Badge",
    iconName: "ShieldCheck",
    theme: "emerald",
    badgeKey: "AI Face Verified",
    accentGlow: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-500/10 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20",
    borderHover: "hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:shadow-emerald-500/10",
  },
  {
    id: "f3",
    titleKey: "features.f3_title",
    descKey: "features.f3_desc",
    fallbackTitle: "Safe & Fun Chats",
    fallbackDesc: "Easy conversation starters, privacy protection, and seamless matchmaking.",
    image: "/images/features/feat-safe-chats.jpg",
    imageAlt: "Safe and Fun In-App Chats",
    iconName: "Sparkles",
    theme: "amber",
    badgeKey: "Encrypted",
    accentGlow: "from-amber-500/20 via-amber-500/10 to-transparent",
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100 shadow-sm shadow-amber-500/10 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20",
    borderHover: "hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-amber-500/10",
  },
];

/**
 * Returns static feature cards configuration.
 * @returns {Array} List of feature cards configuration
 */
export function getLandingFeatures() {
  return defaultFeatureCards;
}

export async function fetchLandingFeatures() {
  return defaultFeatureCards;
}

