export const metadata = {
  title: 'PWA Settings',
  description: 'Manage your Progressive Web App settings and preferences.',
  robots: { index: false, follow: false },
};

export default function PWASettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
