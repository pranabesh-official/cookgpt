import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Recipes",
  description: "Discover AI-curated recipes based on your ingredients and preferences.",
  alternates: { canonical: "/explore-recipes" },
  openGraph: {
    title: "Explore Recipes | CookGPT",
    url: "https://cookgpt.in/explore-recipes",
  },
};

export default function ExploreRecipesLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}


