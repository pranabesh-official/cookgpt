export const metadata = {
  title: "You're offline",
  description: "This page is shown when you're offline.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">You are offline</h1>
      <p className="text-muted-foreground max-w-prose">
        It looks like your device lost connection. Some features may be unavailable.
        We'll automatically reconnect when your network is back.
      </p>
      <a className="underline" href="/">Go to home</a>
    </main>
  );
}


