// Reads the pipeline's committed data at BUILD time (static export). The git JSONL is the
// source of truth; this bakes the latest record + trend into the static pages. A daily
// rebuild refreshes them. Falls back to an embedded seed so the build never breaks.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { LatestFile, HistoryRow } from "@/lib/types";

const DATA = join(process.cwd(), "..", "data");

// Combined national totals across all three court levels (district + High Courts + Supreme Court).
const SEED_LATEST: LatestFile = {
  meta: {
    fetched_at: "2026-07-18T15:49:20.915Z",
    sources: [
      { level: "district", url: "https://njdg.ecourts.gov.in/njdg_v3/" },
      { level: "high_court", url: "https://njdg.ecourts.gov.in/hcnjdg_v2/" },
      { level: "supreme_court", url: "https://scdg.sci.gov.in/scnjdg/" },
    ],
  },
  national: {
    scope: "national",
    court_levels: 3,
    pending: { total: 56423082, civil: 15911809, criminal: 40511273 },
    last_month: {
      instituted: { total: 1805760, civil: 273974, criminal: 1531954 },
      disposed: { total: 1281525, civil: 215758, criminal: 1065905 },
      monthly_clearance_rate_pct: 70.97,
      net_backlog_change: 524235,
    },
    age_profile: {
      under_1yr: { civil: 5290766, criminal: 13587063, total: 18877829, pct_of_pending: 34 },
      y1_to_3: { civil: 3842539, criminal: 9478247, total: 13320786, pct_of_pending: 24 },
      y3_to_5: { civil: 2154305, criminal: 5619066, total: 7773371, pct_of_pending: 14 },
      y5_to_10: { civil: 2680296, criminal: 7303160, total: 9983456, pct_of_pending: 18 },
      above_10yr: { civil: 1869844, criminal: 4500964, total: 6370808, pct_of_pending: 11 },
    },
    derived: { pct_pending_over_3yr: 43, pct_pending_over_5yr: 29 },
    litigants: { senior_citizen_filed: 3317513, women_filed: 3963801 },
  },
  levels: {
    district: { label: "District & subordinate courts", url: "https://njdg.ecourts.gov.in/njdg_v3/", pending: { total: 49867072, civil: 11337624, criminal: 38529448 } },
    high_court: { label: "High Courts", url: "https://njdg.ecourts.gov.in/hcnjdg_v2/", pending: { total: 6460317, civil: 4500126, criminal: 1960191 } },
    supreme_court: { label: "Supreme Court", url: "https://scdg.sci.gov.in/scnjdg/", pending: { total: 95693, civil: 74059, criminal: 21634 } },
  },
};

export function getLatest(): LatestFile {
  try {
    return JSON.parse(readFileSync(join(DATA, "latest.json"), "utf8")) as LatestFile;
  } catch {
    return SEED_LATEST;
  }
}

export function getHistory(): HistoryRow[] {
  try {
    const raw = readFileSync(join(DATA, "history", "national.jsonl"), "utf8");
    const rows = raw.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l) as HistoryRow);
    if (rows.length) return rows;
  } catch {
    /* fall through to seed */
  }
  return [{ fetched_at: SEED_LATEST.meta.fetched_at, pending_total: SEED_LATEST.national.pending.total }];
}
