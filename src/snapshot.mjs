// Snapshot pipeline entrypoint.  Run: `node src/snapshot.mjs`  (or `npm run snapshot`)
//
//   fetch NJDG (district + High Court + Supreme Court) -> parse each -> VALIDATE
//   -> combine into a true national total -> dedupe -> append time-series + latest.json
//
// All three levels use the same server-rendered chart() arguments, so one parser reads
// them all. Designed to run unattended (GitHub Actions cron). Fails loudly on a bad parse.
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

// The three court levels of the National Judicial Data Grid.
const SOURCES = [
  { level: 'district', label: 'District & subordinate courts', url: 'https://njdg.ecourts.gov.in/njdg_v3/', hasAge: true },
  { level: 'high_court', label: 'High Courts', url: 'https://njdg.ecourts.gov.in/hcnjdg_v2/', hasAge: true },
  { level: 'supreme_court', label: 'Supreme Court', url: 'https://scdg.sci.gov.in/scnjdg/', hasAge: false },
];

const AGE = ['under_1yr', 'y1_to_3', 'y3_to_5', 'y5_to_10', 'above_10yr'];
const fmt = (n) => (n == null ? 'n/a' : Number(n).toLocaleString('en-IN'));

// ---- per-level validation: sane bounds + internal consistency ----
function validateLevel(level, rec) {
  const problems = [];
  const p = rec.pending;
  if (!(p.total > 0)) problems.push(`${level}: pending.total missing/zero (${p.total})`);
  if (p.civil != null && p.criminal != null && p.total) {
    const drift = Math.abs(p.civil + p.criminal - p.total) / p.total;
    if (drift > 0.01) problems.push(`${level}: civil+criminal != total (drift ${(drift * 100).toFixed(2)}%)`);
  }
  if (!(rec.last_month.instituted.total >= 0)) problems.push(`${level}: instituted.total missing`);
  if (!(rec.last_month.disposed.total >= 0)) problems.push(`${level}: disposed.total missing`);
  return problems;
}

// ---- combine the levels into one national record (same shape as a single level) ----
function combine(levels) {
  const recs = Object.values(levels);
  const sum = (fn) => recs.reduce((s, r) => s + (Number(fn(r)) || 0), 0);

  const pending = { total: sum((r) => r.pending.total), civil: sum((r) => r.pending.civil), criminal: sum((r) => r.pending.criminal) };
  const instituted = { total: sum((r) => r.last_month.instituted.total), civil: sum((r) => r.last_month.instituted.civil), criminal: sum((r) => r.last_month.instituted.criminal) };
  const disposed = { total: sum((r) => r.last_month.disposed.total), civil: sum((r) => r.last_month.disposed.civil), criminal: sum((r) => r.last_month.disposed.criminal) };

  const age_profile = {};
  for (const b of AGE) {
    const civ = sum((r) => r.age_profile?.[b]?.civil);
    const cri = sum((r) => r.age_profile?.[b]?.criminal);
    age_profile[b] = { civil: civ, criminal: cri, total: civ + cri };
  }
  const ageTotal = AGE.reduce((s, b) => s + age_profile[b].total, 0);
  for (const b of AGE) age_profile[b].pct_of_pending = ageTotal ? Math.round((age_profile[b].total / ageTotal) * 100) : 0;
  const overPct = (keys) => keys.reduce((s, b) => s + age_profile[b].pct_of_pending, 0);

  return {
    scope: 'national',
    court_levels: recs.length,
    pending,
    last_month: {
      instituted,
      disposed,
      monthly_clearance_rate_pct: instituted.total ? +((disposed.total / instituted.total) * 100).toFixed(2) : null,
      net_backlog_change: instituted.total - disposed.total,
    },
    age_profile, // covers district + High Courts (Supreme Court has no age breakdown; ~0.02% of total)
    derived: { pct_pending_over_3yr: overPct(['y3_to_5', 'y5_to_10', 'above_10yr']), pct_pending_over_5yr: overPct(['y5_to_10', 'above_10yr']) },
    litigants: { senior_citizen_filed: sum((r) => r.litigants?.senior_citizen_filed), women_filed: sum((r) => r.litigants?.women_filed) },
  };
}

function toRow(national, levels, meta) {
  return {
    fetched_at: meta.fetched_at,
    scope: 'national (all court levels)',
    pending_total: national.pending.total,
    pending_civil: national.pending.civil,
    pending_criminal: national.pending.criminal,
    district_pending: levels.district.pending.total,
    high_court_pending: levels.high_court.pending.total,
    supreme_court_pending: levels.supreme_court.pending.total,
    instituted_total: national.last_month.instituted.total,
    disposed_total: national.last_month.disposed.total,
    monthly_clearance_rate_pct: national.last_month.monthly_clearance_rate_pct,
    net_backlog_change: national.last_month.net_backlog_change,
    pct_pending_over_3yr: national.derived.pct_pending_over_3yr,
    pct_pending_over_5yr: national.derived.pct_pending_over_5yr,
    senior_citizen_filed: national.litigants.senior_citizen_filed,
    women_filed: national.litigants.women_filed,
  };
}

const lastRow = () => {
  if (!existsSync(HISTORY_FILE)) return null;
  const lines = readFileSync(HISTORY_FILE, 'utf8').trim().split('\n').filter(Boolean);
  return lines.length ? JSON.parse(lines.at(-1)) : null;
};
const unchanged = (a, b) => a && b && a.pending_total === b.pending_total && a.instituted_total === b.instituted_total && a.disposed_total === b.disposed_total;

async function main() {
  Object.values(DIRS).forEach((d) => mkdirSync(d, { recursive: true }));
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');

  const levels = {};
  const levelMeta = {};
  const problems = [];
  let fetched_at = new Date().toISOString();

  for (const src of SOURCES) {
    console.log(`→ ${src.level}: ${src.url}`);
    let f;
    try {
      f = await fetchNjdgHome(src.url);
    } catch (e) {
      problems.push(`${src.level}: fetch failed — ${e.message}`);
      continue;
    }
    fetched_at = f.fetched_at;
    const rec = parseNational(f.html);
    problems.push(...validateLevel(src.level, rec));
    levels[src.level] = { label: src.label, url: src.url, ...rec };
    levelMeta[src.level] = { html_bytes: f.html_bytes, html_sha256: f.html_sha256 };
    console.log(`   pending ${fmt(rec.pending.total)}  (civil ${fmt(rec.pending.civil)} / criminal ${fmt(rec.pending.criminal)})`);
  }

  if (SOURCES.some((s) => !levels[s.level])) problems.push('one or more levels failed to parse — refusing to write a partial national total');

  if (problems.length) {
    const path = join(DIRS.rejected, `national-${stamp}.json`);
    writeFileSync(path, JSON.stringify({ fetched_at, levels, problems }, null, 2));
    console.error('✗ VALIDATION FAILED — not appending. Problems:');
    problems.forEach((p) => console.error('   -', p));
    console.error(`  rejected payload saved to ${path}`);
    process.exit(1);
  }

  const national = combine(levels);
  const meta = { fetched_at, sources: SOURCES.map((s) => ({ level: s.level, url: s.url })) };
  const out = { meta, national, levels };

  writeFileSync(join(DIRS.snapshots, `national-${stamp}.json`), JSON.stringify(out, null, 2));
  writeFileSync(join(ROOT, 'data', 'latest.json'), JSON.stringify(out, null, 2));

  const row = toRow(national, levels, meta);
  const prev = lastRow();
  if (unchanged(row, prev)) {
    console.log('\n• headline figures unchanged since last run — history NOT appended (idempotent).');
  } else {
    appendFileSync(HISTORY_FILE, JSON.stringify(row) + '\n');
    console.log('\n✓ appended new row to data/history/national.jsonl');
  }

  const lm = national.last_month;
  console.log('\n── NATIONAL PULSE (all court levels) ' + '─'.repeat(24));
  console.log(`  pending (total) : ${fmt(national.pending.total)}   (civil ${fmt(national.pending.civil)} / criminal ${fmt(national.pending.criminal)})`);
  console.log(`     district     : ${fmt(levels.district.pending.total)}`);
  console.log(`     high courts  : ${fmt(levels.high_court.pending.total)}`);
  console.log(`     supreme court: ${fmt(levels.supreme_court.pending.total)}`);
  console.log(`  last month      : ${fmt(lm.instituted.total)} filed → ${fmt(lm.disposed.total)} disposed`);
  console.log(`  clearance       : ${lm.monthly_clearance_rate_pct}%   net ${lm.net_backlog_change > 0 ? '+' : ''}${fmt(lm.net_backlog_change)}`);
  console.log(`  pending > 3 yrs : ${national.derived.pct_pending_over_3yr}%   > 10 yrs: ${national.age_profile.above_10yr.pct_of_pending}%`);
  console.log('─'.repeat(60));
}

main().catch((e) => { console.error('PIPELINE ERROR:', e.message); process.exit(1); });
