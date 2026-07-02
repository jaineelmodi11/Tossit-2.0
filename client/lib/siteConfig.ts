/**
 * Public site URL for canonical links, sitemap, robots, and Open Graph.
 * Set NEXT_PUBLIC_SITE_URL to the deployed domain (e.g. https://tossit.app);
 * falls back to localhost for development builds.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = "TossIt";

export const SITE_DESCRIPTION =
  "Point your camera at any waste item and instantly know which bin it belongs in: recycling, organic, or garbage. Track your recycling rate with a live personal dashboard.";
