import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Prompt",
  description: "Internal testing page for prompt validation.",
  alternates: { canonical: "/test-prompt" },
  robots: { index: false, follow: false },
};

export default function TestPromptLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}


