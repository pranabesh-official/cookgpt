import type { Metadata, Viewport } from "next";
import { Inter, Noto_Serif, Roboto_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

// Globally cached fonts with Next's built-in optimization
const sans = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });
const serif = Noto_Serif({ subsets: ["latin"], display: "swap", variable: "--font-serif" });
const mono = Roboto_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "CookGPT - AI-Powered Recipe Creation & Meal Planning | Transform Pantry to Meals",
    template: "%s | CookGPT - AI Recipe Assistant"
  },
  description: "Transform your pantry into delicious meals with CookGPT's AI-powered recipe creation, intelligent meal planning, calorie estimation, and food waste reduction. Cook smarter, eat healthier, save money with personalized cooking assistance.",
  keywords: [
    "AI recipe generator",
    "AI cooking assistant",
    "meal planning app",
    "recipe creation AI",
    "pantry to meal converter",
    "calorie calculator food",
    "cooking app with AI",
    "meal prep planner",
    "healthy recipe generator",
    "food waste reduction app",
    "personalized cooking assistant",
    "smart meal suggestions",
    "ingredient-based recipes",
    "AI chef assistant",
    "cooking technology",
    "recipe optimization",
    "nutritional meal planning",
    "cooking efficiency app",
    "kitchen management tool",
    "culinary AI platform"
  ],
  authors: [{ name: "CookGPT Team" }],
  creator: "CookGPT",
  publisher: "CookGPT",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://cookgpt.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cookgpt.in",
    title: "CookGPT - AI-Powered Recipe Creation & Meal Planning",
    description: "Transform your pantry into delicious meals with AI-powered recipe creation, intelligent meal planning, calorie estimation, and food waste reduction.",
    siteName: "CookGPT",
    images: [
      {
        url: "/cookitnext_logo.png",
        width: 1200,
        height: 630,
        alt: "CookGPT - AI-Powered Recipe Creation and Meal Planning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CookGPT - AI-Powered Recipe Creation & Meal Planning",
    description: "Transform your pantry into delicious meals with AI-powered recipe creation, intelligent meal planning, calorie estimation, and food waste reduction.",
    images: ["/cookitnext_logo.png"],
    creator: "@cookgpt",
    site: "@cookgpt",
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    bing: "your-bing-verification-code",
  },
  manifest: "/manifest.json",
  category: "food",
  other: {
    "application-name": "CookGPT",
    "apple-mobile-web-app-title": "CookGPT",
    "msapplication-TileColor": "#0f172a",
    "theme-color": "#0f172a",
    "color-scheme": "light dark",
    "supported-color-schemes": "light dark",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { rel: "icon", url: "/maskable-icon-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/maskable-icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#0f172a",
    colorScheme: "light dark",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Modern Favicon Setup */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/maskable-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/maskable-icon-512x512.png" />
        
        {/* PWA and Mobile Meta */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CookGPT" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                // Check if we're in production by looking at hostname
                const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
                
                if (isProduction) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                } else {
                  // Ensure no SW during development to avoid caching issues
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (const reg of registrations) { reg.unregister(); }
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
