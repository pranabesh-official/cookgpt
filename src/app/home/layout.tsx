import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "CookGPT helps you cook smarter with AI-powered recipe creation.",
  alternates: { canonical: "/home" },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}


