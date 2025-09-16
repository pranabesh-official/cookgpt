import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Meal Planning",
  description: "Internal testing page for meal planning flows.",
  alternates: { canonical: "/test-meal-planning" },
  robots: { index: false, follow: false },
};

export default function TestMealPlanningLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}


