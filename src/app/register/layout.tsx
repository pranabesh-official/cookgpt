import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Register for CookGPT to start generating recipes and meal plans.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}


