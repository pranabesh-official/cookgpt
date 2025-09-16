import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personalized cooking dashboard with plans, recipes, and insights.",
  alternates: { canonical: "/dashboard" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "CookGPT Dashboard",
    url: "https://cookgpt.in/dashboard",
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}


