import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meal Planning",
  description: "Plan your meals with AI assistance and nutrition insights.",
  alternates: { canonical: "/meal-planning" },
  openGraph: {
    title: "Meal Planning | CookGPT",
    url: "https://cookgpt.in/meal-planning",
  },
};

export default function MealPlanningLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}


