# India Judicial Pulse

A **free, public-service** tool that answers one question about India's courts:
**what's happening, and is it getting better or worse?**

The official [National Judicial Data Grid (NJDG)](https://njdg.ecourts.gov.in/njdg_v3/)
shows the country's pendency *right now*, updated daily — but it has no memory and no
API. This project's whole job is to **remember the public numbers over time** and make
the trend legible. Nobody else does this.

> Scope today: **all three court levels** — district & subordinate courts, the 25 High
> Courts, and the Supreme Court. The headline national figure is a *derived total*: the
> sum of NJDG's three official dashboards (NJDG publishes no single all-India number), and
> the site shows the per-level split so the derivation is transparent. Per-state /
> per-district drill-down is a separate, heavier feed (see *Roadmap*).

## What the snapshot pipeline captures

Each run reads all three NJDG dashboards, combines them into a national total, and records
a single clean row:

| Field | Meaning |
|---|---|
| `pending_total` / `_civil` / `_criminal` | Cases pending, national (the headline) |
| `district_pending` / `high_court_pending` / `supreme_court_pending` | Per-level split that sums to the headline |
| `instituted_total` / `disposed_total` | Cases filed vs. decided in the last month |
| `monthly_clearance_rate_pct` | `disposed ÷ instituted × 100`. Below 100 ⇒ backlog growing |
| `net_backlog_change` | `instituted − disposed` (positive ⇒ pile grew) |
| `pct_pending_over_3yr` / `_over_5yr` | How stuck the backlog is |
| `senior_citizen_filed` / `women_filed` | Filings by these litigant groups |
| `fetched_at` | The reliable time anchor (UTC) |

⚠️ `monthly_clearance_rate_pct` is a **single-month** figure and is noisy (≈71% in a
sample month; measured over a full year the rate is much higher). Read the *trend* across
rows, not any one month. `page_updated_label` is NJDG's own footer string and is **not** a
reliable data date — trust `fetched_at`.

## How it works

```
for each dashboard (district, High Court, Supreme Court):
    fetch homepage ─► parse record ─► VALIDATE (fail loudly)
combine ─► national total ─► dedupe vs last row ─► append data/history/national.jsonl
                                                 └► write data/latest.json { meta, national, levels }
                                                 └► write immutable data/snapshots/*.json (audit)
```

- **National data needs no browser.** Each NJDG dashboard server-renders its figures as
  numeric arguments to its own chart functions (`charts(...)`,
  `pendingAgewiseBarChart(...)`, `fetchStateData(...)`) — the same parser reads all three.
  Far more stable than scraping table cells. Zero third-party dependencies.
- **Validation is load-bearing.** A parse that fails sanity bounds or internal
  consistency (civil + criminal = total, age buckets ≈ total) is written to
  `data/rejected/` and the run exits non-zero — it never appends a bad row.
- **Resilient to the Supreme Court's site (carry-forward).** District + High Courts are
  *critical* — they must fetch fresh or the run fails. The SC's own site
  (`scdg.sci.gov.in`, ~0.017% of the pile) geo-blocks some datacentre IPs (e.g. GitHub CI
  runners) though it serves residential ones. When it's unreachable, the pipeline **carries
  its last-known value forward**, marks it `stale`/`as_of` in `latest.json`
  (`meta.carried_forward`), and the site shows "carried forward · as of &lt;date&gt;" on that
  level — so the daily district + High Court update still publishes and nothing is invented
  or silently substituted. Each fetch has a timeout + 3 retries and surfaces the real cause.
- **Idempotent.** If the headline figures are unchanged since the last row, it saves an
  audit snapshot but does not append — safe to run as often as you like.

## Run it

```bash
node src/snapshot.mjs      # national (district + High Court + Supreme Court)  · npm run snapshot
node src/stateSnapshot.mjs # per-state district-court pending (36 states/UTs)   · npm run states
```

Automated daily by `.github/workflows/snapshot.yml` (GitHub Actions cron), which commits
each new row. That is the "nothing manual" part — the history accumulates on its own.

## The website (`site/`)

The public site is a static-exported **Next.js** app in `site/` (App Router, TypeScript).
It reads the committed data at build time, so there's no server and nothing to keep awake.

```bash
cd site
npm install
npm run dev      # local at http://localhost:4700
npm run build    # static export to site/out/  (served by Netlify — see Deploy below)
```

- **`NEXT_PUBLIC_SITE_URL`** — set this to the deployed origin (e.g. `https://example.org`) so
  the canonical URL, sitemap, `robots.txt`, and the Open Graph / Twitter share cards resolve to
  absolute URLs. Unset, it falls back to `http://localhost:4700` (correct for local only).
- **Data downloads** — `npm run sync:data` (run automatically before `dev`/`build`) copies
  `data/latest.json` and `data/history/national.jsonl` into `site/public/data/`, so the raw
  numbers are downloadable straight from the site at `/data` — no GitHub account needed.
- **Share card & favicon** are generated at build (`opengraph-image`, `icon`) with the latest
  headline number baked in.

## Deploy (Netlify)

The site is a static export, so hosting is just serving `site/out/`. Config lives in
`netlify.toml` (base `site`, publish `out`) and `site/public/_headers`.

1. In Netlify: **Add new site → Import from Git**, pick the `india-judicial-pulse` repo.
   Netlify reads `netlify.toml` — no manual build settings needed.
2. Name the site **`india-judicial-pulse`** so the URL matches
   `NEXT_PUBLIC_SITE_URL` in `netlify.toml` (or set that variable to your custom domain).
3. Deploy. Done.

**It refreshes itself.** Netlify auto-builds on every push to the default branch, and the
daily snapshot bot (`.github/workflows/snapshot.yml`) commits a new data row and pushes —
so each day's reading redeploys the site (fresh numbers + a new trend point) with no extra
workflow. Nothing to keep awake, nothing manual.

> `netlify.toml` sets `ignore = "false"` (always build). Without it, Netlify's base-directory
> optimisation would **skip** the snapshot commits — they touch `data/` at the repo root,
> outside the `site/` base — and the live site would never refresh even though the build
> bakes that data in via `../data`.

> The `_headers` file forces `image/png` on the extensionless `opengraph-image` / `icon`
> routes so link previews render. Keep it if you move to Cloudflare Pages (also supports
> `_headers`); on GitHub Pages you'd instead need a `basePath` and can't set headers.

## Layout

```
src/
  fetchNjdg.mjs      # fetch a public dashboard (browser-like UA, low cadence)
  parseNational.mjs  # pure HTML -> structured record (works for all three levels)
  snapshot.mjs       # fetch 3 dashboards -> parse -> validate -> combine -> persist
data/
  latest.json              # current record { meta, national, levels } — powers the site (committed)
  history/national.jsonl   # the accumulating national time series (committed)
  snapshots/               # immutable per-run records (git-ignored, audit)
  rejected/                # failed parses for post-mortem (git-ignored)
site/                # the production website — static-exported Next.js (see "The website")
web/index.html       # original zero-build prototype dashboard (legacy; site/ supersedes it)
prototype/           # NJDG fragility probes incl. the state->district drill (Playwright)
```

## Legacy prototype (`web/`)

`web/index.html` is the original single-file dashboard (no build step, no dependencies)
that reads `data/latest.json` and `data/history/national.jsonl` directly. The Next.js site
in `site/` supersedes it; the file is kept as a zero-build reference.

## Data practices (green line)

Reads the **public front door** at human cadence; identifies honestly. Does **not** solve
CAPTCHAs, forge the WAF-protected drill-down endpoints, or scrape individual case records.
Reports **systems** — states, districts, courts — never named individual judges or lawyers.

## Roadmap

1. **National pulse pipeline** — *done.* All three court levels, combined into a daily
   national time series.
2. **Website** — *done.* The Next.js site in `site/` (pulse, about & method, open data,
   a "why cases stall" explainer, a single-case CNR lookup) + Netlify deploy.
3. **State ranking (`/map`)** — *done.* All 36 states/UTs ranked by district-court pending
   and by cases-per-capita (Census 2011). `src/stateSnapshot.mjs` (`npm run states`) fetches
   each state's page via a two-step CSRF GET — no browser — and the daily cron runs it.
4. **District drill-down + geographic map** — state → district → court complex; the heavier
   Playwright feed (see `prototype/`), plus a boundary-correct India map.
5. **Pipeline hardening** — parser fixture tests + tighter sanity gates.
6. **`/why` live data** — turn NJDG's coded adjournment reasons into a real per-reason tally.
6. **Historical depth** — one-time load of the Development Data Lab case-level dataset
   (2010–2018) for "why is this place slow" analysis.
