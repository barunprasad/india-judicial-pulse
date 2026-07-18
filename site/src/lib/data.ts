// Reads the pipeline's committed data at BUILD time (static export). The git JSONL is the
// source of truth; this bakes the latest record + trend into the static pages. A daily
// rebuild refreshes them. Falls back to an embedded seed so the build never breaks.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LatestFile, HistoryRow } from '@/lib/types';

const DATA = join(process.cwd(), '..', 'data');

const SEED_LATEST: LatestFile = {
  meta: { url: 'https://njdg.ecourts.gov.in/njdg_v3/', fetched_at: '2026-07-18T08:30:24.804Z' },
  record: {
    page_updated_label: '11-08-2025',
    pending: { total: 49867072, civil: 11337624, criminal: 38529448 },
    last_month: { instituted: { total: 1801610 }, disposed: { total: 1279998 }, monthly_clearance_rate_pct: 71.05, net_backlog_change: 521612 },
    age_profile: {
      under_1yr: { civil: 4154314, criminal: 13039309, total: 17193623, pct_of_pending: 34 },
      y1_to_3: { civil: 2989912, criminal: 9115731, total: 12105643, pct_of_pending: 24 },
      y3_to_5: { civil: 1624368, criminal: 5431710, total: 7056078, pct_of_pending: 14 },
      y5_to_10: { civil: 1708676, criminal: 6939167, total: 8647843, pct_of_pending: 17 },
      above_10yr: { civil: 860354, criminal: 4003531, total: 4863885, pct_of_pending: 10 },
    },
    derived: { pct_pending_over_3yr: 41, pct_pending_over_5yr: 27 },
    litigants: { senior_citizen_filed: 3317513, women_filed: 3963801 },
  },
};

export function getLatest(): LatestFile {
  try {
    return JSON.parse(readFileSync(join(DATA, 'latest.json'), 'utf8')) as LatestFile;
  } catch {
    return SEED_LATEST;
  }
}

export function getHistory(): HistoryRow[] {
  try {
    const raw = readFileSync(join(DATA, 'history', 'national.jsonl'), 'utf8');
    const rows = raw.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l) as HistoryRow);
    if (rows.length) return rows;
  } catch {
    /* fall through to seed */
  }
  const r = SEED_LATEST;
  return [{ fetched_at: r.meta.fetched_at, pending_total: r.record.pending.total }];
}
