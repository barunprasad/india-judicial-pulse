"use client";
import { Tooltip } from "@base-ui/react/tooltip";
import { Accordion } from "@base-ui/react/accordion";
import { AGE_LABELS, AGE_ORDER, grp } from "@/lib/format";
import type { CourtRecord } from "@/lib/types";

function Seg({ w, color, label, group, value }: { w: number; color: string; label: string; group: string; value: number }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={<span style={{ width: w + "%", background: color }} />} />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={8}>
          <Tooltip.Popup className="tip-popup">
            {label} · {group}<br /><b>{grp(value)}</b> cases
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export default function AgeChart({ ageProfile }: { ageProfile: CourtRecord["age_profile"] }) {
  const maxAge = Math.max(...AGE_ORDER.map((b) => ageProfile[b].total));
  return (
    <Tooltip.Provider delay={100}>
      {AGE_ORDER.map((b) => {
        const a = ageProfile[b];
        const w = (a.total / maxAge) * 100;
        const cw = (a.civil / a.total) * 100;
        const kw = (a.criminal / a.total) * 100;
        return (
          <div className="agerow" key={b}>
            <div className="a-lab">{AGE_LABELS[b]}<small>{a.pct_of_pending}% of all</small></div>
            <div className="a-bar" style={{ width: w + "%" }}>
              <Seg w={cw} color="var(--civil)" label={AGE_LABELS[b]} group="Civil" value={a.civil} />
              <Seg w={kw} color="var(--criminal)" label={AGE_LABELS[b]} group="Criminal" value={a.criminal} />
              <span className="a-total">{grp(a.total)}</span>
            </div>
          </div>
        );
      })}

      <Accordion.Root className="reveal">
        <Accordion.Item>
          <Accordion.Header>
            <Accordion.Trigger className="reveal-trigger">View the numbers<span className="reveal-ic">+</span></Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="reveal-panel">
            <table className="data">
              <thead><tr><th>Age</th><th>Civil</th><th>Criminal</th><th>Total</th><th>Share</th></tr></thead>
              <tbody>
                {AGE_ORDER.map((b) => { const a = ageProfile[b]; return (
                  <tr key={b}><td>{AGE_LABELS[b]}</td><td>{grp(a.civil)}</td><td>{grp(a.criminal)}</td><td>{grp(a.total)}</td><td>{a.pct_of_pending}%</td></tr>
                ); })}
              </tbody>
            </table>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </Tooltip.Provider>
  );
}
