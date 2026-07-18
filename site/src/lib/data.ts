// Reads the pipeline's committed data at BUILD time (static export). The git JSONL is the
// source of truth; this bakes the latest record + trend into the static pages. A daily
// rebuild refreshes them. Falls back to an embedded seed so the build never breaks.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { LatestFile, HistoryRow, StatesFile } from "@/lib/types";

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

// Per-state district-court pendency — powers /map. Seed mirrors data/states/latest.json.
const SEED_STATES: StatesFile = {
  meta: {
    fetched_at: "2026-07-18T22:18:04.823Z", source: "https://njdg.ecourts.gov.in/njdg_v3/",
    scope: "district & subordinate courts, by state", state_sum: 49844370, district_national: 49861223, coverage_pct: 99.97, count: 36,
  },
  states: [
    { name: "Uttar Pradesh", code: "9~13", is_ut: false, pending: { total: 11950346, civil: 1887190, criminal: 10063156 } },
    { name: "Maharashtra", code: "27~1", is_ut: false, pending: { total: 6179347, civil: 1792165, criminal: 4387182 } },
    { name: "West Bengal", code: "19~16", is_ut: false, pending: { total: 4104483, civil: 652975, criminal: 3451508 } },
    { name: "Bihar", code: "10~8", is_ut: false, pending: { total: 3764051, civil: 544672, criminal: 3219379 } },
    { name: "Rajasthan", code: "8~9", is_ut: false, pending: { total: 2736479, civil: 525768, criminal: 2210711 } },
    { name: "Karnataka", code: "29~3", is_ut: false, pending: { total: 2320913, civil: 1068777, criminal: 1252136 } },
    { name: "Madhya Pradesh", code: "23~23", is_ut: false, pending: { total: 2134822, civil: 434817, criminal: 1700005 } },
    { name: "Odisha", code: "21~11", is_ut: false, pending: { total: 1869262, civil: 271537, criminal: 1597725 } },
    { name: "Kerala", code: "32~4", is_ut: false, pending: { total: 1813099, civil: 545515, criminal: 1267584 } },
    { name: "Tamil Nadu", code: "33~10", is_ut: false, pending: { total: 1782092, civil: 706220, criminal: 1075872 } },
    { name: "Delhi", code: "7~26", is_ut: true, pending: { total: 1733693, civil: 218123, criminal: 1515570 } },
    { name: "Gujarat", code: "24~17", is_ut: false, pending: { total: 1602737, civil: 320570, criminal: 1282167 } },
    { name: "Haryana", code: "6~14", is_ut: false, pending: { total: 1528782, civil: 432929, criminal: 1095853 } },
    { name: "Punjab", code: "3~22", is_ut: false, pending: { total: 1019347, civil: 377689, criminal: 641658 } },
    { name: "Telangana", code: "36~29", is_ut: false, pending: { total: 1010840, civil: 344997, criminal: 665843 } },
    { name: "Andhra Pradesh", code: "28~2", is_ut: false, pending: { total: 944062, civil: 438848, criminal: 505214 } },
    { name: "Himachal Pradesh", code: "2~5", is_ut: false, pending: { total: 632958, civil: 180969, criminal: 451989 } },
    { name: "Assam", code: "18~6", is_ut: false, pending: { total: 604535, civil: 116958, criminal: 487577 } },
    { name: "Jharkhand", code: "20~7", is_ut: false, pending: { total: 584557, civil: 100259, criminal: 484298 } },
    { name: "Chhattisgarh", code: "22~18", is_ut: false, pending: { total: 489760, civil: 89647, criminal: 400113 } },
    { name: "Jammu and Kashmir", code: "1~12", is_ut: true, pending: { total: 365023, civil: 123831, criminal: 241192 } },
    { name: "Uttarakhand", code: "5~15", is_ut: false, pending: { total: 309509, civil: 51510, criminal: 257999 } },
    { name: "Chandigarh", code: "4~27", is_ut: true, pending: { total: 100405, civil: 24251, criminal: 76154 } },
    { name: "Tripura", code: "16~20", is_ut: false, pending: { total: 76126, civil: 14015, criminal: 62111 } },
    { name: "Goa", code: "30~30", is_ut: false, pending: { total: 63413, civil: 28587, criminal: 34826 } },
    { name: "Puducherry", code: "34~35", is_ut: true, pending: { total: 36872, civil: 11466, criminal: 25406 } },
    { name: "Meghalaya", code: "17~21", is_ut: false, pending: { total: 19159, civil: 5312, criminal: 13847 } },
    { name: "Arunachal Pradesh", code: "12~36", is_ut: false, pending: { total: 16926, civil: 4292, criminal: 12634 } },
    { name: "Manipur", code: "14~25", is_ut: false, pending: { total: 14893, civil: 9535, criminal: 5358 } },
    { name: "Mizoram", code: "15~19", is_ut: false, pending: { total: 9794, civil: 4632, criminal: 5162 } },
    { name: "Andaman and Nicobar", code: "35~28", is_ut: true, pending: { total: 8778, civil: 4188, criminal: 4590 } },
    { name: "Dadra & Nagar Haveli and Daman & Diu", code: "38~38", is_ut: true, pending: { total: 8582, civil: 3800, criminal: 4782 } },
    { name: "Nagaland", code: "13~34", is_ut: false, pending: { total: 4100, civil: 1073, criminal: 3027 } },
    { name: "Sikkim", code: "11~24", is_ut: false, pending: { total: 2267, civil: 947, criminal: 1320 } },
    { name: "Ladakh", code: "37~33", is_ut: true, pending: { total: 1757, civil: 822, criminal: 935 } },
    { name: "Lakshadweep", code: "31~37", is_ut: true, pending: { total: 601, civil: 147, criminal: 454 } },
  ],
};

export function getStates(): StatesFile {
  try {
    return JSON.parse(readFileSync(join(DATA, "states", "latest.json"), "utf8")) as StatesFile;
  } catch {
    return SEED_STATES;
  }
}
