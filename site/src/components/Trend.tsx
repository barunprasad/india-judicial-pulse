import { grp, dayMon } from "@/lib/format";
import type { HistoryRow } from "@/lib/types";

// Total pending over time. Honest about a single data point — it says so, and draws the
// one real reading rather than a fabricated curve. Fills into a line as snapshots accrue.
export default function Trend({ history }: { history: HistoryRow[] }) {
  if (!history || history.length < 2) {
    const only = history?.[history.length - 1];
    return (
      <div className="trend-empty">
        <p style={{ marginTop: 0 }}>
          The line grows a point per day as the pipeline runs — this is the first reading, so
          there&rsquo;s nothing to compare against yet.
        </p>
        <p style={{ margin: 0 }}>
          Latest: <b>{grp(only?.pending_total)}</b> pending{only ? " on " + dayMon(only.fetched_at) : ""}.
        </p>
        <svg className="trend-svg" viewBox="0 0 600 190" preserveAspectRatio="none" aria-hidden="true" style={{ height: 120, marginTop: 10 }}>
          <line x1="0" y1="130" x2="600" y2="130" stroke="var(--grid-line)" />
          <circle cx="300" cy="130" r="5.5" fill="var(--accent)" />
          <circle cx="300" cy="130" r="12" fill="none" stroke="var(--accent)" strokeOpacity="0.3" />
        </svg>
      </div>
    );
  }
  const W = 600, H = 170, pad = 10;
  const ys = history.map((h) => h.pending_total);
  const mn = Math.min(...ys) * 0.999, mx = Math.max(...ys) * 1.001;
  const xs = history.map((_, i) => pad + (i * (W - 2 * pad)) / (history.length - 1));
  const Y = (v: number) => H - pad - ((v - mn) / (mx - mn || 1)) * (H - 2 * pad);
  const line = history.map((h, i) => (i ? "L" : "M") + xs[i].toFixed(1) + " " + Y(h.pending_total).toFixed(1)).join(" ");
  const area = `${line} L${xs[xs.length - 1]} ${H - pad} L${xs[0]} ${H - pad} Z`;
  const last = history.length - 1;
  return (
    <svg className="trend-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img"
      aria-label={`Total pending over ${history.length} readings`}>
      <defs>
        <linearGradient id="tg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#tg)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2" />
      <circle cx={xs[last].toFixed(1)} cy={Y(ys[last]).toFixed(1)} r="4.5" fill="var(--accent)" />
    </svg>
  );
}
