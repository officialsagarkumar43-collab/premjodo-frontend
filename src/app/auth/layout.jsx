export const metadata = {
  title: "Authentication",
  description: "Secure login and authentication callback.",
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

export default function AuthLayout({ children }) {
  return <>{children}</>;
}
