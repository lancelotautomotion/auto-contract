import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/admin/", "/api/", "/onboarding/", "/sign-in/", "/sign-up/"],
    },
    sitemap: "https://kordia.fr/sitemap.xml",
  };
}
