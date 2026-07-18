# Judicial Observability — India

A **free, public-service** tool that answers one question about India's courts:
**what's happening, and is it getting better or worse?**

The official [National Judicial Data Grid (NJDG)](https://njdg.ecourts.gov.in/njdg_v3/)
shows the country's pendency *right now*, updated daily — but it has no memory and no
API. This project's whole job is to **remember the public numbers over time** and make
the trend legible. Nobody else does this.

> Scope of the data layer today: **national, district-and-subordinate courts** (the level
> NJDG serves on its homepage). State/district drill-down and High Court / Supreme Court
> layers are separate, heavier feeds (see *Roadmap*).

## What the snapshot pipeline captures

Each run reads the NJDG district homepage and records a single clean row:

| Field | Meaning |
|---|---|
| `pending_total` / `_civil` / `_criminal` | Cases pending (the headline) |
| `instituted_total` / `disposed_total` | Cases filed vs. decided in the last month |
| `monthly_clearance_rate_pct` | `disposed ÷ instituted × 100`. Below 100 ⇒ backlog growing |
| `net_backlog_change` | `instituted − disposed` (positive ⇒ pile grew) |
| `pct_pending_over_3yr` / `_over_5yr` | How stuck the backlog is |
| `senior_citizen_filed` / `women_filed` | Filings by these litigant groups |
| `fetched_at` | The reliable time anchor (UTC) |

⚠️ `monthly_clearance_rate_pct` is a **single-month** figure and is noisy (≈71% in a
sample month vs. the official **annual** CCR of ≈91%). Read the *trend* across rows, not
any one month. `page_updated_label` is NJDG's own footer string and is **not** a reliable
data date — trust `fetched_at`.

## How it works

```
fetch NJDG homepage ─► parse national record ─► VALIDATE (fail loudly)
      ─► dedupe vs last row ─► append data/history/national.jsonl
                             └► write immutable data/snapshots/*.json (audit)
```

- **National data needs no browser.** NJDG server-renders the figures into the homepage
  as numeric arguments to its own chart functions (`charts(...)`,
  `pendingAgewiseBarChart(...)`, `fetchStateData(...)`). We parse those — far more stable
  than scraping table cells. Zero third-party dependencies.
- **Validation is load-bearing.** A parse that fails sanity bounds or internal
  consistency (civil + criminal = total, age buckets ≈ total) is written to
  `data/rejected/` and the run exits non-zero — it never appends a bad row.
- **Idempotent.** If the headline figures are unchanged since the last row, it saves an
  audit snapshot but does not append — safe to run as often as you like.

## Run it

```bash
node src/snapshot.mjs      # or: npm run snapshot
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
npm run build    # static export to site/out/  (deploy this to any CDN / GitHub Pages / Cloudflare Pages)
```

- **`NEXT_PUBLIC_SITE_URL`** — set this to the deployed origin (e.g. `https://example.org`) so
  the canonical URL, sitemap, `robots.txt`, and the Open Graph / Twitter share cards resolve to
  absolute URLs. Unset, it falls back to `http://localhost:4700` (correct for local only).
- **Data downloads** — `npm run sync:data` (run automatically before `dev`/`build`) copies
  `data/latest.json` and `data/history/national.jsonl` into `site/public/data/`, so the raw
  numbers are downloadable straight from the site at `/data` — no GitHub account needed.
- **Share card & favicon** are generated at build (`opengraph-image`, `icon`) with the latest
  headline number baked in.

## Layout

```
src/
  fetchNjdg.mjs      # fetch the public homepage (browser-like UA, low cadence)
  parseNational.mjs  # pure HTML -> structured record (unit-testable)
  snapshot.mjs       # fetch -> parse -> validate -> dedupe -> persist
data/
  latest.json              # current full record — powers the UI (committed)
  history/national.jsonl   # the accumulating time series (committed)
  snapshots/               # immutable per-run records (git-ignored, audit)
  rejected/                # failed parses for post-mortem (git-ignored)
web/
  index.html               # the "National Pulse" dashboard — self-contained, theme-aware
prototype/           # NJDG fragility probes incl. the state->district drill (Playwright)
```

## The Pulse UI

`web/index.html` is a single self-contained page (no build step, no dependencies) that
reads `data/latest.json` for the current state and `data/history/national.jsonl` for the
trend. Open it directly or serve the repo root and browse to `/web/`. It shows total
pending + civil/criminal split, monthly clearance rate, net flow, the age profile, filings
by women / senior citizens, and a trend line that fills in as the daily snapshots
accumulate. Deploy it free on GitHub Pages alongside the committed data.

## Data practices (green line)

Reads the **public front door** at human cadence; identifies honestly. Does **not** solve
CAPTCHAs, forge the WAF-protected drill-down endpoints, or scrape individual case records.
Reports **systems** — states, districts, courts — never named individual judges or lawyers.

## Roadmap

1. **National pulse pipeline** — *done.* Accumulates the daily time series.
2. **Pulse UI** — *done.* `web/index.html`. Adds the state choropleth once (3) lands.
3. **State / district drill-down feed** — the heavier Playwright scraper (see `prototype/`).
4. **Historical depth** — one-time load of the Development Data Lab case-level dataset
   (2010–2018) for "why is this place slow" analysis.
