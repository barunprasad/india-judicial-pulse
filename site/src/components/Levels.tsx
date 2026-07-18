import { grp, human } from "@/lib/format";
import type { LevelKey, LevelSummary } from "@/lib/types";

// Machine-style three-column feature section — the national total, split across the three
// court levels it's summed from. Makes the derivation transparent (never a black-box number).
const DESC: Record<LevelKey, string> = {
  district:
    "The trial courts, where almost every case begins — and where the overwhelming majority stay. The bulk of the national pile.",
  high_court:
    "The 25 High Courts: appeals, writs, and constitutional questions across the states.",
  supreme_court:
    "The apex court — the final word. The smallest pile, but the weightiest.",
};
const ORDER: LevelKey[] = ["district", "high_court", "supreme_court"];

export default function Levels({ levels, nationalTotal }: { levels: Record<LevelKey, LevelSummary>; nationalTotal: number }) {
  return (
    <div className="levels">
      {ORDER.map((k, i) => {
        const lv = levels[k];
        const pctNum = (lv.pending.total / nationalTotal) * 100;
        const pct = pctNum < 1 ? "<1%" : Math.round(pctNum) + "%";
        return (
          <div className="level" key={k} data-animate>
            <div className="level-top">
              <span className="level-n mono">0{i + 1}</span>
              <span className="level-share" title={`${pct} of all pending cases`}>
                <i style={{ width: `${pctNum}%` }} />
              </span>
            </div>
            <h3 className="level-h">{lv.label}</h3>
            <div className="level-num">{grp(lv.pending.total)}</div>
            <div className="level-meta mono">{pct} of the pile &middot; ~{human(lv.pending.total)} pending</div>
            {lv.stale ? (
              <div className="level-stale mono" title="This court's dashboard was unreachable from our servers on the last run, so we're showing the figure we last read directly.">
                &#9888; carried forward{lv.as_of ? ` · as of ${new Date(lv.as_of).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}
              </div>
            ) : null}
            <p className="level-desc">{DESC[k]}</p>
          </div>
        );
      })}
    </div>
  );
}
