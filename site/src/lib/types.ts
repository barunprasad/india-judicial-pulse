// Shared data shapes: per-level records + the combined national record + trend history.

export type AgeKey = "under_1yr" | "y1_to_3" | "y3_to_5" | "y5_to_10" | "above_10yr";

export interface AgeBucket {
  civil: number;
  criminal: number;
  total: number;
  pct_of_pending: number;
}

// The combined national record (each single level shares this shape too).
export interface CourtRecord {
  scope?: string;
  court_levels?: number;
  page_updated_label?: string | null;
  pending: { total: number; civil: number; criminal: number };
  last_month: {
    instituted: { total: number; civil?: number; criminal?: number };
    disposed: { total: number; civil?: number; criminal?: number };
    monthly_clearance_rate_pct: number;
    net_backlog_change: number;
  };
  age_profile: Record<AgeKey, AgeBucket>;
  derived: { pct_pending_over_3yr: number; pct_pending_over_5yr: number };
  litigants: { senior_citizen_filed: number; women_filed: number };
}

export interface LevelSummary {
  label: string;
  url?: string;
  pending: { total: number; civil: number; criminal: number };
}

export type LevelKey = "district" | "high_court" | "supreme_court";

export interface SnapshotMeta {
  fetched_at: string;
  sources?: { level: string; url: string }[];
}

export interface LatestFile {
  meta: SnapshotMeta;
  national: CourtRecord;
  levels: Record<LevelKey, LevelSummary>;
}

export interface HistoryRow {
  fetched_at: string;
  pending_total: number;
  [k: string]: unknown;
}
