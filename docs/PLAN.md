# India Judicial Pulse — Build Plan

A free, public-service instrument for seeing what is happening in India's courts — and
which way it is moving. Not a government portal. Mobile-first. Honest by design.

Status as of 2026-07-18: Phase 0 (national snapshot pipeline + first UI + NJDG fragility
proven) is **done**. This plan covers everything after that.

---

## 1. What "actually useful" means here

The bar is not "a nicer dashboard." It is that four different people get something real:

- **A citizen** sees, in five seconds, how bad the backlog is and whether it is growing —
  and can look up their own case.
- **A journalist** can point to *their district* vs the national picture, with a citable,
  versioned number and a link to the raw data.
- **A researcher** gets clean, downloadable, time-stamped data nobody else keeps.
- **Anyone** understands *why* cases are stuck, not just how many — the story no official
  dashboard tells.

If a feature doesn't serve one of those, it doesn't ship.

---

## 2. Decisions (the ones left to me, made)

### Visual direction — "The National Docket, as an instrument"
Metaphor: a public **almanac/ledger crossed with mission-control** — a precise reading
instrument pointed at a vast, overloaded system. This is what keeps it from looking
governmental (governments splash brand colour everywhere and lead with seals).

- **Theme: dark-first "observatory", with a fully designed light "daylight ledger" mode.**
  Dark is the signature — glowing data lives well on it and it reads as serious and modern.
  Light exists because a genuinely useful public tool must be readable in daylight, on a
  cheap phone, and in print. Both are token-based and designed (not an inverted flip).
  The viewer's OS preference and an in-page toggle both drive it.
- **Colour is reserved for meaning — the chrome is near-monochrome.** Cool charcoal/ink
  neutrals for everything structural; colour appears *only* where it encodes data:
  civil = blue `#2a78d6`, criminal = orange `#eb6834` (validated CVD-safe, both themes),
  backlog growing = red, shrinking = green. Interactive/live elements use the data-blue.
  No third decorative hue. This discipline is itself the anti-government-site move.

### Iconography — no emoji, no stock icon-library look
A **small bespoke monoline SVG set**, single 1.5px stroke, 24px grid, engraved-almanac
sensibility. Drawn from the subject, avoiding the gavel/scales clichés: age-strata
(stacked backlog layers), a queue, an ageing clock, a hearing/calendar mark, a
district-cell (not a map pin). Where a label will do, use the **mono "readout" tag**
language instead of an icon. Inline SVG only — no icon font, no emoji.

### Typography — self-hosted, distinctive, avoids the AI-default faces
Real app (unlike an artifact) can self-host fonts, so we use character. All OFL:
- **Display / big numbers: Bricolage Grotesque** — contemporary, characterful, not on the
  overused list (deliberately not Inter/Space Grotesk).
- **Body / UI: IBM Plex Sans** — engineered, institutional-but-not-governmental.
- **Data / labels / axis / readouts: IBM Plex Mono** — the "instrument readout" voice.
Numbers use `tabular-nums`; the hero figure gets its own scale.

### Motion — one signature moment, disciplined support
- **Signature: the live backlog ticker.** Net backlog grows ~5.2 lakh/month ≈ ~12 cases a
  minute. A counter ticks up *while you read*: "since you opened this page, ~N cases were
  added to the pile." Honest (computed from real net flow), visceral, unmistakably not a
  government site. This is the product's identity.
- Support: count-ups on the hero, chart draw-ins on scroll (bars grow from the axis, the
  trend line draws itself), a canvas particle-field hero where each mark = N cases,
  page transitions via the View Transitions API.
- **Restraint is a rule.** `prefers-reduced-motion` fully honoured; never fire everything
  at once; cap particle counts on small screens. Maximalism here reads as AI-generated.
- Stack: Framer Motion (component), GSAP + ScrollTrigger (scroll/timeline), plain Canvas
  (particles), Lenis (smooth scroll). Everything transform/opacity-based for mobile perf.

### Stack
- **Next.js (App Router), static-first.** Pages are statically generated / ISR-revalidated
  daily; one server API route for the case lookup. One framework for UI + the single
  dynamic feature.
- **Storage: no database in the request path.** Git-committed JSONL snapshots are the
  source of truth (transparent, versioned, free forever). A build step precomputes static
  JSON (and a Parquet file for the drill-down, queried in-browser with **DuckDB-WASM**).
  A hosted DB (**Neon** if ever — it auto-resumes on query, unlike Supabase's week-idle
  pause) is only a build-time convenience and is not required.
- **Hosting: Cloudflare Pages** (most generous free static tier) + **GitHub Actions** cron
  for the daily snapshot and rebuild. Everything stays in free tiers; nothing sleeps
  because nothing but `/case` needs a server.

### Responsive — mobile-first, non-negotiable
Designed at 360px first, enhanced up. Single-column stack on mobile; hero number scales
with `clamp()`; charts reflow (horizontal bars stack; **the choropleth becomes a ranked
list with spark-bars on small screens** — a map is the wrong primitive on a phone); touch
targets ≥ 44px; a compact bottom nav on mobile. No horizontal body scroll ever; wide
content scrolls within its own container. Test at 360 / 768 / 1200.

---

## 3. Information architecture

Primary nav: **Pulse · Map · Why · Your case · About**

| Route | Page | Job | Render | Data |
|---|---|---|---|---|
| `/` | The Pulse | national, now, which way — the 5-second gut-punch + the live ticker | static, daily | NJDG national (all court levels) |
| `/map` | Where | where is it worst, where is it moving; per-capita toggle; "movers" | static, daily | NJDG state/district drill + population |
| `/place/[state]` | A state | one state vs national, its trend, delay reasons, fairness context | static, daily | drill feed + IJR vacancy |
| `/place/[state]/[district]` | A district | one district and its courts | static, daily | drill feed |
| `/why` | Why it's stuck | reframes how-many → why; the human cost; scrollytelling | static, daily | NJDG delay reasons + NCRB undertrials |
| `/case` | Your case | look up one CNR: duration, hearings, next date, judges, advocates-on-record | **server, on-demand** | eCourts CNR (user-solved CAPTCHA) |
| `/about` | How we know | sources, method, caveats, raw-data links, license | static | — |

Only `/case` touches a server. Everything else is static files on a CDN.

---

## 4. Data sources → features (using the research)

| Source | Powers | Access reality (from research) |
|---|---|---|
| **NJDG district** (`njdg_v3`) | the Pulse, age profile, clearance, delay reasons | server-rendered numbers in homepage HTML — `curl`-parseable, no browser. **Done for the core; delay-reasons + stage-wise still to parse.** |
| **NJDG High Court** (`hcnjdg_v2`) + **Supreme Court** (`scdg.sci.gov.in`) | "national" = all court levels | same parse approach; extends coverage. Phase 1. |
| **NJDG state/district drill** (`home/fetchDist…`) | the Map + place pages | AJAX behind a WAF → **headless browser required** (proven in `prototype/`, Karnataka = 31 districts). Phase 3. |
| **Population — SHRUG / Census, joined via LGD codes** | per-capita normalization (fairer than raw counts) | LGD codes are the standard join key for court names ↔ boundaries. Phase 3. |
| **India Justice Report** | judge-vacancy / capacity context so ranking is fair | state-level, CC BY. Phase 3. |
| **NCRB Prison Statistics** | the human cost on `/why` (undertrials awaiting trial) | official periodic data. Phase 2. |
| **Development Data Lab (2010–2018, ~81M cases)** | historical depth: how long cases *actually* take | bulk, static, license (ODbL vs CC-BY) to resolve with DDL first. Phase 4. |
| **AWS Open Data judgments (SC + HC, CC-BY)** | judgment text / outcomes, a search layer | clean automated S3 feed. Phase 4 (optional). |
| **eCourts CNR** | `/case` lookup | CAPTCHA per query, one at a time — user-driven only, green line. Phase 4. |
| **DAKSH (CC BY-NC — usable, non-commercial)** | hearing-level depth incl. Karnataka | gated request. Optional enrichment. |

---

## 5. Build & data flow (why it's free forever)

```
NJDG (all levels) ──(daily GitHub Action)──► git JSONL snapshots  ◄── source of truth
                                                     │
                                          (build step: precompute)
                                                     ▼
                       static JSON per page  +  Parquet for the drill-down
                                                     │
                                        Cloudflare Pages (static CDN)
                                                     │
                       5 of 6 page types served fully static (DuckDB-WASM in the
                       browser queries the Parquet for /map + place drill-downs)
                                                     │
        /case only ──► Next.js API route ──► on-demand eCourts lookup (the sole server bit)
```

The daily Action snapshots, validates (fail-loud), commits the new row, and triggers the
rebuild. No per-request database, so nothing sleeps and the free tier never breaks.

---

## 6. Phased roadmap

**Phase 0 — Foundation (DONE).** National snapshot pipeline, first pulse UI, NJDG fragility
proven, guardrails documented.

**Phase 1 — The Pulse, productionised (2–3 wks).**
Scaffold Next.js + the design system (tokens, self-hosted fonts, bespoke icon set,
mobile-first grid). Port the pulse to it, wired to the static build. **Extend the scraper
to High Court + Supreme Court** so "national" means all court levels. Ship the live backlog
ticker, `/`, `/about`. Deploy to Cloudflare Pages + cron. Guardrails (systems-not-judges,
honest caveats, data-quality flags) baked in here.

**Phase 2 — Why it's stuck (1–2 wks).**
Parse NJDG **delay-reason** + stage-wise + undated/excessive data. Add **NCRB undertrial**
figures. Build `/why` with a short scrollytelling sequence. This is the editorial
differentiator.

**Phase 3 — Geography (3–4 wks).**
Build the **headless-browser state→district drill feed** (proven in `prototype/`); snapshot
per place over time. Precompute per-place static JSON + Parquet; DuckDB-WASM querying.
**Population join (SHRUG/LGD)** for per-capita; **IJR vacancy** for fairness context. Build
`/map` (list-first on mobile) + `/place/[state]/[district]` + the "movers" rail.

**Phase 4 — Depth & your case (3–4 wks).**
Load the **Development Data Lab** historical dataset for "how long cases actually take"
distributions (resolve license first). Optionally the **AWS judgment** text layer. Build
`/case` (CNR lookup, on-demand server, user-solved CAPTCHA — green line). This phase has the
only real hosting cost (a browser runtime for lookups) — ships last.

---

## 7. Guardrails (baked in from Phase 1, never retrofitted)

- **Score systems, never named individuals.** Every metric keys to state / district /
  court-complex / case-type. Judge identity is used only to route a case to the right
  bench, then dropped before analytics. No individual judge/lawyer leaderboard — ever.
  (Legal: 2026 draft AI regulation + *Madhu Trehan* contempt precedent.)
- **De-identify by default;** hard statutory bar on POCSO / sexual-offence / matrimonial
  identity; honour right-to-be-forgotten.
- **Honesty in the UI:** the monthly-clearance "noisy, read the trend" caveat, the
  `fetched_at` vs page-label distinction, scope labels, per-unit data-quality flags,
  minimum case-volume thresholds before showing a score.
- **Green-line data practices only:** public front door at human cadence; no CAPTCHA
  solving, no forged WAF-blocked endpoints, no re-identification.

---

## 8. Open questions to settle before Phase 3–4

1. Resolve the DDL license (ODbL vs CC-BY) directly with `info@devdatalab.org`.
2. Where the `/case` lookup runtime lives (on-demand GitHub Action vs a small free-tier
   container) — the one piece that isn't trivially free.
3. Whether to file the (slow, long-shot) formal eCommittee/NIC data-sharing request now as
   a parallel track.
