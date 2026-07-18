// Fetch an NJDG homepage. The national aggregates are server-rendered into these pages
// (no browser / no CAPTCHA needed) — only the state/district DRILL-DOWN needs a headless
// browser (see prototype/). We read the public front door as a browser would, at a low
// (daily) cadence, with a timeout + a few retries so a transient blip doesn't fail the run.
import { createHash } from 'node:crypto';

export const NJDG_DISTRICT_HOME = 'https://njdg.ecourts.gov.in/njdg_v3/';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

// Node's `fetch` throws a generic "fetch failed" and stashes the real reason on `.cause`
// (ECONNRESET, ETIMEDOUT, certificate errors, HTTP status, …). Surface it so a CI failure
// is diagnosable instead of opaque.
function describe(e) {
  const c = e?.cause;
  const detail = c ? (c.code || c.message || String(c)) : e?.message;
  return detail || 'unknown error';
}

async function fetchOnce(url, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
      redirect: 'follow',
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchNjdgHome(url = NJDG_DISTRICT_HOME, { retries = 3, timeoutMs = 25000 } = {}) {
  let last;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const html = await fetchOnce(url, timeoutMs);
      const sha256 = createHash('sha256').update(html).digest('hex');
      return {
        url,
        html,
        html_bytes: Buffer.byteLength(html),
        html_sha256: sha256,
        fetched_at: new Date().toISOString(),
      };
    } catch (e) {
      last = describe(e);
      if (attempt < retries) await new Promise((r) => setTimeout(r, attempt * 1500));
    }
  }
  throw new Error(`${last} (after ${retries} attempts, ${url})`);
}
