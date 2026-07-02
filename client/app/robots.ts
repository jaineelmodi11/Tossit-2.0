import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private, auth-gated pages: nothing useful for crawlers to index.
        disallow: ["/home", "/scan", "/history", "/profile"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
