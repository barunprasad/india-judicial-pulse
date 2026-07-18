// Fetch the NJDG district-court homepage. The national aggregates are server-rendered
// into this page (no browser / no CAPTCHA needed) — only the state/district DRILL-DOWN
// needs a headless browser (see prototype/). We read the public front door as a browser
// would, at a low (daily) cadence.
import { createHash } from 'node:crypto';

export const NJDG_DISTRICT_HOME = 'https://njdg.ecourts.gov.in/njdg_v3/';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

export async function fetchNjdgHome(url = NJDG_DISTRICT_HOME) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-IN,en;q=0.9',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`NJDG fetch failed: HTTP ${res.status} for ${url}`);
  const html = await res.text();
  const sha256 = createHash('sha256').update(html).digest('hex');
  return {
    url,
    html,
    html_bytes: Buffer.byteLength(html),
    html_sha256: sha256,
    fetched_at: new Date().toISOString(),
  };
}
