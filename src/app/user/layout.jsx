import UserLayoutClient from "./UserLayoutClient";

export const metadata = {
  title: "Dashboard",
  description: "User dashboard and private matchmaking area.",
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

export default function UserLayout({ children }) {
  return <UserLayoutClient>{children}</UserLayoutClient>;
}
