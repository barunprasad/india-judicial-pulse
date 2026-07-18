import type { Metadata } from "next";
import { getStates } from "@/lib/data";
import { STATE_POPULATION_2011 } from "@/lib/statePopulation";
import { fmtWhen, grp, human } from "@/lib/format";
import StatesRanked, { type StateStat } from "@/components/StatesRanked";

export const metadata: Metadata = {
  title: "Where the backlog is worst — state by state",
  description:
    "India's district-court backlog, every state and union territory ranked — by total pending and, more fairly, by cases per person. Read from NJDG.",
};

export default function MapPage() {
  const { meta, states } = getStates();
  const districtNational = meta.district_national || meta.state_sum;

  const rows: StateStat[] = states.map((s) => {
    const pop = STATE_POPULATION_2011[s.name] ?? null;
    const perLakh = pop ? s.pending.total / (pop / 100000) : null;
    const pct = districtNational ? Math.round((s.pending.total / districtNational) * 1000) / 10 : 0;
    return { name: s.name, isUt: !!s.is_ut, total: s.pending.total, civil: s.pending.civil, criminal: s.pending.criminal, perLakh, pct };
  });

  const topTotal = [...rows].sort((a, b) => b.total - a.total)[0];
  const topPer = [...rows].filter((r) => r.perLakh != null).sort((a, b) => (b.perLakh ?? 0) - (a.perLakh ?? 0))[0];

  return (
    <div className="wrap">
      <header className="masthead">
        <p className="eyebrow">Where &middot; states &amp; union territories</p>
        <h1>Where is the backlog <span className="serif">worst</span>?</h1>
        <p className="lede">
          The national pile isn&rsquo;t spread evenly. Here is every state and UT ranked by its district-court
          backlog &mdash; and, because big states carry big piles simply by size, also by <b>cases per person</b>,
          the fairer lens.
        </p>
        <div className="statusbar">
          <span className="tag num">{grp(meta.state_sum)} cases · {meta.count} states/UTs</span>
          <span className="tag">read {fmtWhen(meta.fetched_at)}</span>
        </div>
      </header>

      <div className="findings">
        <div className="finding">
          <div className="finding-lab mono">Most cases</div>
          <div className="finding-v">{topTotal.name}</div>
          <div className="finding-sub mono">{human(topTotal.total)} pending · {topTotal.pct}% of all district-court cases</div>
        </div>
        <div className="finding">
          <div className="finding-lab mono">Most per person</div>
          <div className="finding-v">{topPer.name}</div>
          <div className="finding-sub mono">~{grp(Math.round(topPer.perLakh ?? 0))} pending per 1 lakh people</div>
        </div>
        <div className="finding">
          <div className="finding-lab mono">Coverage</div>
          <div className="finding-v">{meta.coverage_pct}%</div>
          <div className="finding-sub mono">state sum vs NJDG&rsquo;s district national — cross-checked</div>
        </div>
      </div>

      <StatesRanked rows={rows} />

      <div className="map-notes">
        <p className="cav-h mono">Read this fairly</p>
        <ul>
          <li><b>District &amp; subordinate courts only.</b> This is NJDG&rsquo;s district dashboard sliced by
            state &mdash; where the great majority of cases live. A state&rsquo;s High Court is a separate figure,
            not included here.</li>
          <li><b>Per-capita is approximate.</b> It uses 2011 Census populations (India&rsquo;s last full census);
            real populations today are higher, and unevenly &mdash; so treat &ldquo;per 1 lakh&rdquo; as a guide,
            not a precise rate.</li>
          <li><b>Size isn&rsquo;t blame.</b> A big pile often means a big population, not a failing court. Judge
            vacancies, filings per judge and population all matter &mdash; we&rsquo;ll add vacancies next so an
            overloaded court isn&rsquo;t mistaken for a lazy one.</li>
          <li><b>Coming next:</b> district-level drill-down (state → district → court complex) and a geographic
            map. This ranked view is the honest first cut &mdash; precise, and it works on any phone.</li>
        </ul>
      </div>
    </div>
  );
}
