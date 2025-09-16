import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cookgpt.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/home",
    "/about",
    "/demo",
    "/explore-recipes",
    "/meal-planning",
    "/onboarding",
    "/preferences",
    "/login",
    "/register",
    "/terms",
    "/cancellation",
    "/offline",
    "/test-meal-planning",
    "/test-prompt",
    "/dashboard",
  ];

  return staticRoutes.map((path) => ({
    url: `${BASE_URL}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "/dashboard" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/dashboard" ? 0.8 : 0.6,
  }));
}


