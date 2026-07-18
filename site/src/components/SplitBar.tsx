import { grp } from "@/lib/format";

// Civil / criminal split — a slim bar + legend. `centered` for the hero.
export default function SplitBar({
  total,
  civil,
  criminal,
  centered,
}: {
  total: number;
  civil: number;
  criminal: number;
  centered?: boolean;
}) {
  const c = (civil / total) * 100;
  const k = (criminal / total) * 100;
  return (
    <div className={"splitwrap" + (centered ? " centered" : "")}>
      <h3 className="split-h">Civil &amp; criminal</h3>
      <div className="splitbar" role="img" aria-label={`Civil ${c.toFixed(0)} percent, criminal ${k.toFixed(0)} percent`}>
        <span style={{ width: c + "%", background: "var(--civil)" }} />
        <span style={{ width: k + "%", background: "var(--criminal)" }} />
      </div>
      <div className="split-legend">
        <span><span className="sw" style={{ background: "var(--civil)" }} /> Civil <b>{c.toFixed(0)}% &middot; {grp(civil)}</b></span>
        <span><span className="sw" style={{ background: "var(--criminal)" }} /> Criminal <b>{k.toFixed(0)}% &middot; {grp(criminal)}</b></span>
      </div>
    </div>
  );
}
