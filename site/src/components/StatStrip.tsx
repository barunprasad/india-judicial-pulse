import type { ReactNode } from "react";
import { grp } from "@/lib/format";
import type { CourtRecord } from "@/lib/types";
import CountUp from "@/components/CountUp";

type Stat = { lab: string; val: ReactNode; valClass?: string; pill: { cls: string; label: string }; meter?: number; meterColor?: string; exp: ReactNode };

// The four "is the country keeping up?" readings — an editorial stat strip, not boxes.
export default function StatStrip({ record }: { record: CourtRecord }) {
  const lm = record.last_month;
  const growing = lm.net_backlog_change > 0;
  const over3 = record.age_profile.y3_to_5.total + record.age_profile.y5_to_10.total + record.age_profile.above_10yr.total;
  const clr = lm.monthly_clearance_rate_pct;

  const stats: Stat[] = [
    {
      lab: "Clearance · last month",
      val: <CountUp value={clr} decimals={Number.isInteger(clr) ? 0 : 2} suffix="%" />,
      pill: clr < 100 ? { cls: "grow", label: "losing ground" } : { cls: "shrink", label: "gaining" },
      meter: Math.min(clr, 100),
      meterColor: clr < 100 ? "var(--criminal)" : "var(--shrink)",
      exp: <>For every 100 filed last month, ~{Math.round(clr)} were decided. Under 100, the pile grows.</>,
    },
    {
      lab: "Net change · last month",
      val: <>{growing ? "+" : ""}<CountUp value={lm.net_backlog_change} /></>,
      valClass: growing ? "c-grow" : "c-shrink",
      pill: growing ? { cls: "grow", label: "backlog grew" } : { cls: "shrink", label: "backlog fell" },
      exp: <>{grp(lm.instituted.total)} filed, {grp(lm.disposed.total)} decided &mdash; the gap is the growth.</>,
    },
    {
      lab: "Over 3 years old",
      val: <CountUp value={record.derived.pct_pending_over_3yr} suffix="%" />,
      pill: { cls: "warn", label: "ageing" },
      exp: <>{grp(over3)} cases have been open longer than three years.</>,
    },
    {
      lab: "Over 10 years old",
      val: <CountUp value={record.age_profile.above_10yr.pct_of_pending} suffix="%" />,
      pill: { cls: "warn", label: "the hard core" },
      exp: <>{grp(record.age_profile.above_10yr.total)} cases have waited more than a decade.</>,
    },
  ];

  return (
    <div className="stats">
      {stats.map((s) => (
        <div className="stat" key={s.lab} data-animate>
          <div className="stat-top">
            <span className="stat-lab">{s.lab}</span>
            <span className={`pill ${s.pill.cls}`}><i />{s.pill.label}</span>
          </div>
          <div className={`stat-val ${s.valClass || ""}`}>{s.val}</div>
          {s.meter != null ? (
            <div className="meter"><i style={{ width: s.meter + "%", background: s.meterColor }} /><span className="m100" style={{ left: "100%" }} /></div>
          ) : null}
          <div className="stat-exp">{s.exp}</div>
        </div>
      ))}
    </div>
  );
}
