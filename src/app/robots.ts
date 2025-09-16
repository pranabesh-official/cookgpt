import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cookgpt.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/offline/",
        "/test-meal-planning/",
        "/test-prompt/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}


