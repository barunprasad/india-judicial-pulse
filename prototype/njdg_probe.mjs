// NJDG drill-down fragility probe — exploratory.
// Goal: confirm a headless browser gets past the WAF that blocked curl,
// and locate where the real pendency numbers render in the DOM.
import { chromium } from 'playwright';

const BASE = 'https://njdg.ecourts.gov.in/njdg_v3/';
const SP = '/private/tmp/claude-501/-Users-barunprasad-workspace-personal-space-judicial-observability/4cbe4018-2e8d-4896-bb63-f3df8cea027a/scratchpad';

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
    locale: 'en-IN',
  });
  const page = await ctx.newPage();

  // Log the XHR data calls the page makes, to see the real endpoints + responses.
  const apiHits = [];
  page.on('response', async (res) => {
    const u = res.url();
    if (u.includes('/home/')) {
      let bodyLen = -1;
      try { bodyLen = (await res.body()).length; } catch {}
      apiHits.push({ status: res.status(), url: u.replace(BASE, ''), bytes: bodyLen });
    }
  });

  console.log('→ loading homepage…');
  const resp = await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
  console.log('  top-level status:', resp && resp.status());
  console.log('  page title:', await page.title());

  // Give AJAX-driven counters/tables time to populate.
  await page.waitForTimeout(6000);

  // Pull every number that looks like an Indian-grouped figure (e.g. 4,98,50,387).
  const bodyText = await page.evaluate(() => document.body.innerText);
  const bigNums = [...bodyText.matchAll(/\b\d{1,2}(?:,\d{2})+,\d{3}\b/g)].map((m) => m[0]);
  console.log('  Indian-grouped numbers found on page:', bigNums.slice(0, 25));

  // How many data tables + rows rendered?
  const tableInfo = await page.evaluate(() => {
    const tbls = [...document.querySelectorAll('table')];
    return tbls.map((t) => ({ id: t.id || '(no id)', rows: t.querySelectorAll('tr').length }))
      .filter((t) => t.rows > 1).slice(0, 12);
  });
  console.log('  tables with data:', JSON.stringify(tableInfo));

  await page.screenshot({ path: `${SP}/njdg_home.png`, fullPage: false });
  console.log('  screenshot saved.');

  console.log('\n→ /home/ XHR calls the page made:');
  for (const h of apiHits.slice(0, 30)) console.log(`   [${h.status}] ${h.url}  (${h.bytes} bytes)`);

  await browser.close();
};

run().catch((e) => { console.error('PROBE ERROR:', e.message); process.exit(1); });
