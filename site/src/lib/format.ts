// Formatting + plain-language helpers. Indian digit grouping throughout.
import type { AgeKey } from "@/lib/types";

const IN = new Intl.NumberFormat("en-IN");

export const grp = (n: number | null | undefined): string =>
  n == null ? "n/a" : IN.format(Math.round(n));

const trim = (x: number): string => x.toFixed(2).replace(/\.?0+$/, "");

// Humanise to crore / lakh so a layperson can feel the scale.
export function human(n: number | null | undefined): string {
  if (n == null) return "n/a";
  if (n >= 1e7) return trim(n / 1e7) + " crore";
  if (n >= 1e5) return trim(n / 1e5) + " lakh";
  return IN.format(Math.round(n));
}

export const AGE_LABELS: Record<AgeKey, string> = {
  under_1yr: "Under 1 yr",
  y1_to_3: "1-3 yrs",
  y3_to_5: "3-5 yrs",
  y5_to_10: "5-10 yrs",
  above_10yr: "Over 10 yrs",
};
export const AGE_ORDER: AgeKey[] = ["under_1yr", "y1_to_3", "y3_to_5", "y5_to_10", "above_10yr"];

// One friendly date string, computed once at build (stable — no hydration mismatch).
export function fmtWhen(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " + d.toISOString().slice(11, 16) + " UTC"
  );
}
export const dayMon = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
