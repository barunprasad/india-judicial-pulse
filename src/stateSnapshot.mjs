// Per-STATE pendency snapshot — the data behind the /map page.
// Run: `node src/stateSnapshot.mjs`  (or `npm run states`)
//
// NJDG has no one-shot all-states endpoint (the map-drawing function is dead code and its
// endpoint 500s). But each state's page is server-rendered and curl-able — no browser — via
// a two-step, CSRF-token GET, and carries that state's district-court pending in the SAME
// charts() call the national parser reads. So we loop the 36 state/UT codes.
//
// Scope: this is the DISTRICT & subordinate courts dashboard (njdg_v3) sliced by state — NOT
// a state's High Court. The 36 state totals sum to ~the district national total (cross-check).
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'data', 'states');
const BASE = 'https://njdg.ecourts.gov.in/njdg_v3/';
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

// The 36 states/UTs and their NJDG state_code values (from the homepage <select>).
const STATES = [
  { code: '9~13', name: 'Uttar Pradesh' }, { code: '27~1', name: 'Maharashtra' },
  { code: '19~16', name: 'West Bengal' }, { code: '10~8', name: 'Bihar' },
  { code: '8~9', name: 'Rajasthan' }, { code: '29~3', name: 'Karnataka' },
  { code: '23~23', name: 'Madhya Pradesh' }, { code: '21~11', name: 'Odisha' },
  { code: '32~4', name: 'Kerala' }, { code: '33~10', name: 'Tamil Nadu' },
  { code: '24~17', name: 'Gujarat' }, { code: '28~2', name: 'Andhra Pradesh' },
  { code: '36~29', name: 'Telangana' }, { code: '20~7', name: 'Jharkhand' },
  { code: '3~22', name: 'Punjab' }, { code: '18~6', name: 'Assam' },
  { code: '22~18', name: 'Chhattisgarh' }, { code: '6~14', name: 'Haryana' },
  { code: '7~26', name: 'Delhi' }, { code: '5~15', name: 'Uttarakhand' },
  { code: '1~12', name: 'Jammu and Kashmir' }, { code: '2~5', name: 'Himachal Pradesh' },
  { code: '16~20', name: 'Tripura' }, { code: '17~21', name: 'Meghalaya' },
  { code: '14~25', name: 'Manipur' }, { code: '13~34', name: 'Nagaland' },
  { code: '30~30', name: 'Goa' }, { code: '12~36', name: 'Arunachal Pradesh' },
  { code: '34~35', name: 'Puducherry' }, { code: '15~19', name: 'Mizoram' },
  { code: '4~27', name: 'Chandigarh' }, { code: '11~24', name: 'Sikkim' },
  { code: '35~28', name: 'Andaman and Nicobar' }, { code: '37~33', name: 'Ladakh' },
  { code: '31~37', name: 'Lakshadweep' }, { code: '38~38', name: 'Dadra & Nagar Haveli and Daman & Diu' },
];

const UT_CODES = new Set(['35~28', '4~27', '7~26', '37~33', '31~37', '34~35', '38~38', '1~12']);
const fmt = (n) => (n == null ? 'FAIL' : Number(n).toLocaleString('en-IN'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- session cookie jar (session + rotating CSRF token live in cookies) ---
let jar = {};
const cookieHeader = () => Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
function absorb(res) {
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  for (const c of sc) { const kv = c.split(';')[0]; const i = kv.indexOf('='); if (i > 0) jar[kv.slice(0, i)] = kv.slice(i + 1); }
}
async function get(url, timeoutMs = 25000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-IN,en;q=0.9', Cookie: cookieHeader() },
      redirect: 'follow', signal: ctrl.signal,
    });
    absorb(res);
    return await res.text();
  } finally { clearTimeout(t); }
}

// charts(disp_civ, disp_cri, disp_tot, pend_civ, pend_cri, pend_tot, …) — args 3/4/5 = pending.
const toInt = (s) => Number(String(s).replace(/[^0-9-]/g, ''));
function parsePending(html) {
  const m = html.match(/charts\(([^)]*)\)/);
  if (!m) return null;
  const a = m[1].split(',').map((x) => x.trim());
  const civil = toInt(a[3]), criminal = toInt(a[4]), total = toInt(a[5]);
  if (!(total > 0)) return null;
  return { total, civil, criminal };
}

// Two-step CSRF GET for one state: token stub → full page. A couple of retries for a blip.
async function fetchState(st) {
  const u0 = `${BASE}?p=home/index&state_code=${encodeURIComponent(st.code)}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const stub = await get(u0);
      const tm = stub.match(/app_token=([a-f0-9]{40,80})/);
      if (tm) {
        const page = await get(`${u0}&app_token=${tm[1]}`);
        const scoped = new RegExp(`value="${st.code}" selected`).test(page); // guard: right state
        const pending = parsePending(page);
        if (pending && scoped) return pending;
      }
    } catch { /* retry */ }
    await sleep(attempt * 800);
  }
  return null;
}

// district national total (the cross-check the state sum should ~match)
function districtNationalTotal() {
  try {
    const d = JSON.parse(readFileSync(join(ROOT, 'data', 'latest.json'), 'utf8'));
    return d.levels?.district?.pending?.total ?? null;
  } catch { return null; }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  await get(BASE); // establish session cookies
  const fetched_at = new Date().toISOString();

  const states = [];
  const failed = [];
  for (const st of STATES) {
    const pending = await fetchState(st);
    if (pending) {
      states.push({ name: st.name, code: st.code, is_ut: UT_CODES.has(st.code), pending });
      console.log(`  ✓ ${st.name.padEnd(30)} ${fmt(pending.total)}`);
    } else {
      failed.push(st.name);
      console.warn(`  ✗ ${st.name.padEnd(30)} FAILED`);
    }
    await sleep(400);
  }

  // Validation. Most states must succeed, and their sum must land near the district national.
  const problems = [];
  if (states.length < STATES.length - 2) problems.push(`${failed.length} states failed to fetch: ${failed.join(', ')}`);
  const stateSum = states.reduce((s, r) => s + r.pending.total, 0);
  const natl = districtNationalTotal();
  const coverage = natl ? +((stateSum / natl) * 100).toFixed(2) : null;
  if (natl && (coverage < 95 || coverage > 105)) problems.push(`state sum ${fmt(stateSum)} is ${coverage}% of district national ${fmt(natl)} — out of tolerance`);

  if (problems.length) {
    console.error('\n✗ VALIDATION FAILED — not writing:');
    problems.forEach((p) => console.error('   -', p));
    process.exit(1);
  }

  states.sort((a, b) => b.pending.total - a.pending.total);
  const out = {
    meta: {
      fetched_at,
      source: BASE,
      scope: 'district & subordinate courts, by state',
      state_sum: stateSum,
      district_national: natl,
      coverage_pct: coverage,
      count: states.length,
    },
    states,
  };
  writeFileSync(join(OUT_DIR, 'latest.json'), JSON.stringify(out, null, 2));

  console.log(`\n✓ wrote data/states/latest.json — ${states.length} states/UTs`);
  console.log(`  state sum ${fmt(stateSum)}  =  ${coverage}% of district national ${fmt(natl)}`);
  if (failed.length) console.log(`  (carried none; ${failed.length} soft-failed: ${failed.join(', ')})`);
}

main().catch((e) => { console.error('STATE PIPELINE ERROR:', e.message); process.exit(1); });
