import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Tell us your preferences to personalize recipes and meal plans.",
  alternates: { canonical: "/onboarding" },
  robots: { index: false, follow: true },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}


