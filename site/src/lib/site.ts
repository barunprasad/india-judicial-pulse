// One place for the site's identity — used by metadata, the OG image, sitemap and robots.
// The deployed URL is DERIVED at build, in priority order:
//   1. NEXT_PUBLIC_SITE_URL — explicit override (e.g. a custom domain), if you set one;
//   2. URL — the primary site address Netlify injects automatically on every build;
//   3. http://localhost:4700 — the local-dev fallback (locally the site really is here).
// So production never needs the hardcoded value — Netlify's own URL fills it in.
export const SITE = {
  name: "India Judicial Pulse",
  short: "Judicial Pulse",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? "http://localhost:4700",
  tagline: "What is happening in India's courts",
  description:
    "A free, public reading of India's court backlog: how many cases are pending across the district courts, High Courts and Supreme Court, how fast they clear, and which way it is moving. Taken from NJDG and kept over time.",
  locale: "en_IN",
} as const;

export const ROUTES = ["/", "/map", "/why", "/case", "/about", "/data"] as const;
