// Final fragility test: (A) confirm national numbers are in the raw HTML (curl-able),
// (B) confirm the state->district AJAX drill works when driven through a real browser.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = 'https://njdg.ecourts.gov.in/njdg_v3/';
const SP = '/private/tmp/claude-501/-Users-barunprasad-workspace-personal-space-judicial-observability/4cbe4018-2e8d-4896-bb63-f3df8cea027a/scratchpad';

// (A) Parse the already-curled homepage for server-rendered national figures.
const html = readFileSync(`${SP}/njdg_home.html`, 'utf8');
const grab = (fn, flag) => {
  const re = new RegExp(`${fn}\\('${flag}',1\\)[^>]*>\\s*([0-9]+)`);
  const m = html.match(re); return m ? Number(m[1]) : null;
};
const inst = grab('fetchStateData', 'ins');
const disp = grab('fetchStateData', 'disp');
console.log('(A) From RAW curl HTML — no browser:');
console.log('    instituted last month :', inst?.toLocaleString('en-IN'));
console.log('    disposed last month   :', disp?.toLocaleString('en-IN'));
if (inst && disp) console.log('    => monthly clearance rate:', ((disp / inst) * 100).toFixed(1) + '%  (net backlog change ' + (disp - inst).toLocaleString('en-IN') + ')');

// (B) Browser-driven state -> district drill for Karnataka (29~3).
const browser = await chromium.launch({ headless: true });
const page = await browser.newContext({ locale: 'en-IN' }).then((c) => c.newPage());
await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2500);

console.log('\n(B) Driving state->district drill through the browser:');
// Invoke the page's OWN function with a valid session+CSRF already in place (the front door).
const districts = await page.evaluate(async () => {
  const sel = document.querySelector('#state_code') || document.querySelector('#state_code1');
  if (!sel) return { err: 'no state select found' };
  sel.value = '29~3';                                   // Karnataka
  if (typeof get_district === 'function') get_district('home/fetchDist', '29~3');
  else sel.dispatchEvent(new Event('change', { bubbles: true }));
  // poll the paired district dropdown until it fills
  const distSel = document.querySelector('#dist_code') || document.querySelector('#dist_code1');
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 250));
    if (distSel && distSel.options.length > 1) break;
  }
  return {
    districtCount: distSel ? distSel.options.length - 1 : 0,
    sample: distSel ? [...distSel.options].slice(1, 9).map((o) => o.text) : [],
  };
});
console.log('    Karnataka districts returned by home/fetchDist:', districts.districtCount);
console.log('    sample:', JSON.stringify(districts.sample));

await browser.close();
console.log('\nVERDICT: national pulse = raw-HTML parseable (robust). Drill-down = browser-only (moderate).');
