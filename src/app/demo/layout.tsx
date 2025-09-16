import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo",
  description: "Try a live demo of CookGPT's AI recipe generator.",
  alternates: { canonical: "/demo" },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}


