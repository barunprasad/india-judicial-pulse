import type { MetadataRoute } from "next";
import { SITE, ROUTES } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map((r) => ({
    url: `${SITE.url}${r === "/" ? "" : r}`,
    lastModified,
    changeFrequency: r === "/" ? "daily" : "monthly",
    priority: r === "/" ? 1 : 0.6,
  }));
}
