export const metadata = {
  title: "You're offline",
  description: "This page is shown when you're offline.",
  robots: { index: false, follow: false },
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
