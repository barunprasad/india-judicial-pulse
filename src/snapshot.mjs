// Snapshot pipeline entrypoint.  Run: `node src/snapshot.mjs`  (or `npm run snapshot`)
//
//   fetch NJDG homepage  ->  parse national record  ->  VALIDATE (fail loudly)
//   ->  dedupe vs last row  ->  append flat time-series row + write immutable snapshot
//
// Designed to run unattended on a schedule (GitHub Actions cron / any scheduler).
// It never appends a row that fails validation — a bad parse writes to data/rejected/
// and exits non-zero so the scheduler surfaces it instead of silently poisoning history.
import { mkdirSync, appendFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fetchNjdgHome } from './fetchNjdg.mjs';
import { parseNational } from './parseNational.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIRS = {
  history: join(ROOT, 'data', 'history'),
  snapshots: join(ROOT, 'data', 'snapshots'),
  rejected: join(ROOT, 'data', 'rejected'),
};
const HISTORY_FILE = join(DIRS.history, 'national.jsonl');

// ---- validation: sanity bounds + internal consistency ----------------------
function validate(rec) {
  const problems = [];
  const p = rec.pending;
  if (rec._errors.length) problems.push(...rec._errors);
  if (!(p.total > 30_000_000 && p.total < 90_000_000))
    problems.push(`pending.total out of sane band (3-9 cr): ${p.total}`);
  if (p.civil != null && p.criminal != null && p.total != null) {
    const drift = Math.abs(p.civil + p.criminal - p.total) / p.total;
    if (drift > 0.005) problems.push(`civil+criminal != total (drift ${(drift * 100).toFixed(2)}%)`);
  }
  const ageTotal = Object.values(rec.age_profile).reduce((s, b) => s + (b.total || 0), 0);
  if (p.total && ageTotal) {
    const drift = Math.abs(ageTotal - p.total) / p.total;
    if (drift > 0.02) problems.push(`age buckets sum drifts from total by ${(drift * 100).toFixed(2)}%`);
  }
  if (!(rec.last_month.instituted.total > 0)) problems.push('instituted.total missing/zero');
  if (!(rec.last_month.disposed.total > 0)) problems.push('disposed.total missing/zero');
  return problems;
}

// ---- flat time-series row (one JSONL line per accepted snapshot) -----------
function toRow(rec, meta) {
  return {
    fetched_at: meta.fetched_at,
    page_updated_label: rec.page_updated_label,
    court_level: rec.court_level,
    scope: rec.scope,
    pending_total: rec.pending.total,
    pending_civil: rec.pending.civil,
    pending_criminal: rec.pending.criminal,
    instituted_total: rec.last_month.instituted.total,
    disposed_total: rec.last_month.disposed.total,
    monthly_clearance_rate_pct: rec.last_month.monthly_clearance_rate_pct,
    net_backlog_change: rec.last_month.net_backlog_change,
    pct_pending_over_3yr: rec.derived.pct_pending_over_3yr,
    pct_pending_over_5yr: rec.derived.pct_pending_over_5yr,
    senior_citizen_filed: rec.litigants.senior_citizen_filed,
    women_filed: rec.litigants.women_filed,
    html_sha256: meta.html_sha256,
    parser_version: rec.parser_version,
  };
}

function lastRow() {
  if (!existsSync(HISTORY_FILE)) return null;
  const lines = readFileSync(HISTORY_FILE, 'utf8').trim().split('\n').filter(Boolean);
  return lines.length ? JSON.parse(lines.at(-1)) : null;
}

// unchanged if the headline figures match the previous accepted row
const unchanged = (a, b) =>
  a && b &&
  a.pending_total === b.pending_total &&
  a.instituted_total === b.instituted_total &&
  a.disposed_total === b.disposed_total;

const fmt = (n) => (n == null ? 'n/a' : Number(n).toLocaleString('en-IN'));

async function main() {
  Object.values(DIRS).forEach((d) => mkdirSync(d, { recursive: true }));
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');

  console.log('→ fetching NJDG homepage…');
  const fetched = await fetchNjdgHome();
  console.log(`  ${fetched.html_bytes.toLocaleString()} bytes, sha256 ${fetched.html_sha256.slice(0, 12)}…`);
  // Keep the raw HTML out of persisted records (metaLite); only debug/rejected keeps it.
  const { html: rawHtml, ...metaLite } = fetched;

  const rec = parseNational(fetched.html);
  const problems = validate(rec);

  if (problems.length) {
    const path = join(DIRS.rejected, `national-${stamp}.json`);
    writeFileSync(path, JSON.stringify({ meta: metaLite, record: rec, problems }, null, 2));
    // keep the raw html too, for post-mortem
    writeFileSync(join(DIRS.rejected, `national-${stamp}.html`), rawHtml);
    console.error('✗ VALIDATION FAILED — not appending. Problems:');
    problems.forEach((p) => console.error('   -', p));
    console.error(`  rejected payload saved to ${path}`);
    process.exit(1);
  }

  const row = toRow(rec, fetched);
  const prev = lastRow();

  // Immutable per-run snapshot (full nested record) — always written for audit.
  const snapPath = join(DIRS.snapshots, `national-${stamp}.json`);
  writeFileSync(snapPath, JSON.stringify({ meta: metaLite, record: rec }, null, 2));

  // Current full record for the UI (rich nested state) — always refreshed, committed.
  writeFileSync(join(ROOT, 'data', 'latest.json'), JSON.stringify({ meta: metaLite, record: rec }, null, 2));

  if (unchanged(row, prev)) {
    console.log('• headline figures unchanged since last run — snapshot saved, history NOT appended (idempotent).');
  } else {
    appendFileSync(HISTORY_FILE, JSON.stringify(row) + '\n');
    console.log('✓ appended new row to data/history/national.jsonl');
  }

  console.log('\n── NATIONAL PULSE ' + '─'.repeat(40));
  console.log(`  fetched_at       : ${fetched.fetched_at}   (page label: "${rec.page_updated_label || 'n/a'}")`);
  console.log(`  pending (total)  : ${fmt(rec.pending.total)}   (civil ${fmt(rec.pending.civil)} / criminal ${fmt(rec.pending.criminal)})`);
  console.log(`  last month       : ${fmt(row.instituted_total)} filed  →  ${fmt(row.disposed_total)} disposed`);
  console.log(`  clearance (month): ${row.monthly_clearance_rate_pct}%   net backlog ${row.net_backlog_change > 0 ? '+' : ''}${fmt(row.net_backlog_change)}`);
  console.log(`  pending > 3 yrs  : ${rec.derived.pct_pending_over_3yr}%     > 5 yrs: ${rec.derived.pct_pending_over_5yr}%`);
  console.log(`  filed by: women ${fmt(rec.litigants.women_filed)} · senior citizens ${fmt(rec.litigants.senior_citizen_filed)}`);
  console.log('─'.repeat(58));
}

main().catch((e) => {
  console.error('PIPELINE ERROR:', e.message);
  process.exit(1);
});
