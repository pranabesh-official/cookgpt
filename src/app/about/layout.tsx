import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CookGPT",
  description: "Learn about CookGPT's mission to turn ingredients into meals with AI.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About CookGPT",
    url: "https://cookgpt.in/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}


