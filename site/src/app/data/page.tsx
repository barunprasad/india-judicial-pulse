import type { Metadata } from "next";
import { ArrowSquareOutIcon, FileJsIcon, TableIcon } from "@phosphor-icons/react/dist/ssr";
import { getLatest, getHistory } from "@/lib/data";
import { fmtWhen, grp } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get the data",
  description:
    "Download the raw numbers behind India Judicial Pulse — the latest snapshot and the full daily time-series. Free to read, quote and reuse.",
};

export default function DataPage() {
  const { meta, national } = getLatest();
  const history = getHistory();

  return (
    <div className="wrap">
        <header className="masthead">
          <p className="eyebrow">Data &middot; open for anyone</p>
          <h1>Get the raw data.</h1>
          <p className="lede">
            Every number on this site comes from two plain files you can download right here &mdash; no
            account, no API key, no scraping. Free to read, quote, chart and reuse.
          </p>
          <div className="statusbar">
            <span className="tag num">Latest: {grp(national.pending.total)} pending</span>
            <span className="tag">{history.length} daily reading{history.length === 1 ? "" : "s"}</span>
          </div>
        </header>

        <div className="doc">
          <div className="prose">
            <h2 id="files">The files</h2>
            <div className="files">
              <a className="file" href="/data/latest.json" download>
                <span className="file-ic"><FileJsIcon size={20} /></span>
                <span className="file-main">
                  <span className="file-name">latest.json</span>
                  <span className="file-desc">The most recent reading &mdash; national totals plus the split
                    across district, High Court and Supreme Court.</span>
                </span>
                <span className="file-fmt mono">JSON</span>
              </a>
              <a className="file" href="/data/history/national.jsonl" download>
                <span className="file-ic"><TableIcon size={20} /></span>
                <span className="file-main">
                  <span className="file-name">national.jsonl</span>
                  <span className="file-desc">The full time-series &mdash; one flat row per daily reading, ready
                    for a spreadsheet or a chart. Grows by one line a day.</span>
                </span>
                <span className="file-fmt mono">JSONL</span>
              </a>
            </div>
            <p className="figcap">
              Last updated {fmtWhen(meta.fetched_at)}. The files refresh whenever the daily pipeline records a
              new reading.
            </p>

            <h2 id="use">Using it</h2>
            <p>The history file is <b>JSON Lines</b>{" "}&mdash; one JSON object per line, so you can stream it or
              load it a row at a time. A quick look from a terminal:</p>
            <pre className="code"><code>{`# the latest snapshot
curl -s ${SITE.url}/data/latest.json | jq .national.pending

# the whole time-series, newest last
curl -s ${SITE.url}/data/history/national.jsonl`}</code></pre>
            <p>Each history row carries the fields you&rsquo;d expect: <code>fetched_at</code>,
              <code> pending_total</code> (and its civil / criminal split), the per-level totals
              (<code>district_pending</code>, <code>high_court_pending</code>, <code>supreme_court_pending</code>),
              last month&rsquo;s <code>instituted_total</code> / <code>disposed_total</code>, the
              <code> monthly_clearance_rate_pct</code>, and the <code>net_backlog_change</code>.</p>

            <h2 id="terms">Terms &mdash; the honest bit</h2>
            <ul>
              <li><b>Free &amp; open.</b>{" "}Use it for journalism, research, teaching, a class project, a tweet
                &mdash; anything. A link back is appreciated so readers can check the source too.</li>
              <li><b>Not legal evidence.</b>{" "}These are aggregate public figures for understanding the system, not
                a substitute for an official case record or a certified court document.</li>
              <li><b>The source of truth is NJDG.</b>{" "}We keep and re-present its public numbers; where our figure
                is a derivation (the national total is the sum of three official dashboards) we say so on the
                page and show the parts.</li>
            </ul>
          </div>

          <aside className="doc-rail">
            <div className="rail">
              <p className="rail-h">At a glance</p>
              <div className="rail-row"><span className="rail-k">Format</span><span className="rail-v">JSON · JSONL</span></div>
              <div className="rail-row"><span className="rail-k">Source</span><span className="rail-v">NJDG (official)</span></div>
              <div className="rail-row"><span className="rail-k">Refreshed</span><span className="rail-v">Daily</span></div>
              <div className="rail-row"><span className="rail-k">Licence</span><span className="rail-v">Free &amp; open</span></div>
              <div className="rail-row"><span className="rail-k">Readings</span><span className="rail-v">{history.length}</span></div>
            </div>
            <div className="rail">
              <p className="rail-h">Straight to source</p>
              <nav className="rail-toc">
                <a href="https://njdg.ecourts.gov.in/njdg_v3/" target="_blank" rel="noopener">District dashboard <ArrowSquareOutIcon size={12} /></a>
                <a href="https://njdg.ecourts.gov.in/hcnjdg_v2/" target="_blank" rel="noopener">High Court dashboard <ArrowSquareOutIcon size={12} /></a>
                <a href="https://scdg.sci.gov.in/scnjdg/" target="_blank" rel="noopener">Supreme Court dashboard <ArrowSquareOutIcon size={12} /></a>
              </nav>
            </div>
          </aside>
        </div>
      </div>
  );
}
