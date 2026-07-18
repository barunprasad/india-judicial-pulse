// One place for the site's identity — used by metadata, the OG image, sitemap and robots.
// The URL comes from the deploy env; the localhost fallback keeps local builds honest
// (share cards resolve to real absolute URLs only once NEXT_PUBLIC_SITE_URL is set).
export const SITE = {
  name: "India Judicial Pulse",
  short: "Judicial Pulse",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4700",
  tagline: "What is happening in India's courts",
  description:
    "A free, public reading of India's court backlog: how many cases are pending across the district courts, High Courts and Supreme Court, how fast they clear, and which way it is moving. Taken from NJDG and kept over time.",
  locale: "en_IN",
} as const;

export const ROUTES = ["/", "/map", "/why", "/case", "/about", "/data"] as const;
