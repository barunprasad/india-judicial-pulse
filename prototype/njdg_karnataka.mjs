// NJDG — drill into ONE state (Karnataka = 29~3) and extract structured rows.
// Tests how stable the state drill-down is and what a real scraper would parse.
import { chromium } from 'playwright';

const BASE = 'https://njdg.ecourts.gov.in/njdg_v3/';
const SP = '/private/tmp/claude-501/-Users-barunprasad-workspace-personal-space-judicial-observability/4cbe4018-2e8d-4896-bb63-f3df8cea027a/scratchpad';

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
    locale: 'en-IN',
  });
  const page = await ctx.newPage();

  // Capture EVERY POST/XHR and its response size + a snippet, to map real endpoints.
  const xhr = [];
  page.on('response', async (res) => {
    const req = res.request();
    if (req.method() === 'POST' || res.url().includes('home/')) {
      let snippet = '';
      try { snippet = (await res.text()).slice(0, 120).replace(/\s+/g, ' '); } catch {}
      xhr.push({ m: req.method(), status: res.status(), url: res.url().replace(BASE, ''), snippet });
    }
  });

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Find every <select> that carries a Karnataka option, and drive the first one.
  const selectors = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('select').forEach((s) => {
      const kar = [...s.options].find((o) => /karnataka/i.test(o.text));
      if (kar) out.push({ id: s.id, name: s.name, value: kar.value, onchange: s.getAttribute('onchange') });
    });
    return out;
  });
  console.log('→ selects offering Karnataka:');
  selectors.forEach((s) => console.log(`   #${s.id} (val=${s.value}) onchange=${s.onchange}`));

  // Drive the national-dashboard state selector if present.
  const target = selectors.find((s) => /natmast_state_code/.test(s.id)) || selectors[0];
  if (target && target.id) {
    console.log(`\n→ selecting Karnataka via #${target.id} …`);
    try {
      await page.selectOption(`#${target.id}`, target.value);
      // Fire onchange explicitly in case selectOption doesn't trigger the inline handler.
      await page.evaluate((id) => {
        const el = document.getElementById(id);
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, target.id);
      await page.waitForTimeout(6000);
    } catch (e) { console.log('   selectOption error:', e.message); }
  }

  // Extract numbers visible after the drill.
  const after = await page.evaluate(() => {
    const t = document.body.innerText;
    const nums = [...t.matchAll(/\b\d{1,2}(?:,\d{2})+,\d{3}\b/g)].map((m) => m[0]);
    // grab any table row mentioning a Karnataka district for proof of drill-down
    const rows = [...document.querySelectorAll('tr')]
      .map((r) => r.innerText.replace(/\t+/g, ' | ').replace(/\s*\n\s*/g, ' ').trim())
      .filter((x) => x.length > 4 && /\d/.test(x));
    return { nums: nums.slice(0, 20), sampleRows: rows.slice(0, 15) };
  });
  console.log('\n→ numbers after Karnataka drill:', after.nums);
  console.log('\n→ sample data rows:');
  after.sampleRows.forEach((r) => console.log('   ', r.slice(0, 140)));

  await page.screenshot({ path: `${SP}/njdg_karnataka.png`, fullPage: true });

  console.log('\n→ POST / home XHR endpoints observed:');
  const seen = new Set();
  for (const h of xhr) {
    const key = h.url.split('?')[0];
    if (seen.has(key)) continue; seen.add(key);
    console.log(`   [${h.m} ${h.status}] ${key}  ::  ${h.snippet.slice(0, 80)}`);
  }

  await browser.close();
};
run().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
