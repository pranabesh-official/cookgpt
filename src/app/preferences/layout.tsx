import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preferences",
  description: "Set dietary preferences, allergies, and goals for tailored results.",
  alternates: { canonical: "/preferences" },
  robots: { index: false, follow: true },
};

export default function PreferencesLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}


