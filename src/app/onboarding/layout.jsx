export const metadata = {
  title: "Profile Onboarding",
  description: "Complete your profile on Prem Jodo.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function OnboardingLayout({ children }) {
  return <>{children}</>;
}
