"use client";

import { useState } from "react";
import { grp, human } from "@/lib/format";

export type StateStat = {
  name: string;
  isUt: boolean;
  total: number;
  civil: number;
  criminal: number;
  perLakh: number | null; // pending per 1 lakh people (Census 2011), null if no population
  pct: number; // share of the district national total
};

type SortKey = "total" | "perLakh" | "name";
const SORTS: [SortKey, string][] = [
  ["total", "Total pending"],
  ["perLakh", "Per 1 lakh people"],
  ["name", "A–Z"],
];

export default function StatesRanked({ rows }: { rows: StateStat[] }) {
  const [sort, setSort] = useState<SortKey>("total");

  const sorted = [...rows].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "perLakh") return (b.perLakh ?? -1) - (a.perLakh ?? -1);
    return b.total - a.total;
  });
  const barMetric = (r: StateStat) => (sort === "perLakh" ? r.perLakh ?? 0 : r.total);
  const max = Math.max(...rows.map(barMetric), 1);

  return (
    <div className="states">
      <div className="states-sort">
        <span className="states-sort-lab mono">Sort by</span>
        {SORTS.map(([k, label]) => (
          <button key={k} type="button" className={"chip" + (sort === k ? " on" : "")} aria-pressed={sort === k} onClick={() => setSort(k)}>
            {label}
          </button>
        ))}
      </div>

      <ol className="states-list">
        {sorted.map((r, i) => {
          const w = (barMetric(r) / max) * 100;
          const civW = r.total ? (r.civil / r.total) * w : 0;
          const criW = r.total ? (r.criminal / r.total) * w : 0;
          const primary = sort === "perLakh" ? (r.perLakh != null ? `${grp(Math.round(r.perLakh))}` : "—") : grp(r.total);
          const primaryUnit = sort === "perLakh" ? " / lakh" : "";
          const secondary = sort === "perLakh" ? `${human(r.total)} total` : (r.perLakh != null ? `${grp(Math.round(r.perLakh))}/lakh · ${r.pct}%` : `${r.pct}% of pile`);
          return (
            <li className="state-row" key={r.name}>
              <span className="state-rank mono">{sort === "name" ? "·" : i + 1}</span>
              <span className="state-name">
                {r.name}
                {r.isUt ? <span className="state-ut mono">UT</span> : null}
              </span>
              <span className="state-val">
                <b className="mono">{primary}<span className="state-unit">{primaryUnit}</span></b>
                <span className="state-val-2 mono">{secondary}</span>
              </span>
              <span className="state-bar" aria-hidden="true">
                <i className="civ" style={{ width: `${civW}%` }} />
                <i className="cri" style={{ width: `${criW}%` }} />
              </span>
            </li>
          );
        })}
      </ol>

      <div className="states-legend mono">
        <span><span className="sw" style={{ background: "var(--civil)" }} /> Civil</span>
        <span><span className="sw" style={{ background: "var(--criminal)" }} /> Criminal</span>
        <span className="states-legend-note">bar length = {sort === "perLakh" ? "cases per 1 lakh people" : "total pending"}</span>
      </div>
    </div>
  );
}
