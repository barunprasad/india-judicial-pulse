import type { ReactNode } from "react";

// Honest placeholder for planned routes — real content + a status rail so the page reads
// like a considered document, not a dead end with empty space.
export default function Planned({
  eyebrow,
  title,
  lede,
  children,
  rail,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children: ReactNode;
  rail?: ReactNode;
}) {
  return (
    <div className="wrap">
        <header className="masthead">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lede">{lede}</p>
          <div className="statusbar"><span className="tag">In progress</span></div>
        </header>

        <div className="doc">
          <div className="prose">{children}</div>
          <aside className="doc-rail">
            {rail ?? (
              <div className="rail">
                <p className="rail-h">Status</p>
                <div className="rail-row"><span className="rail-k">Stage</span><span className="rail-v">Building</span></div>
                <div className="rail-row"><span className="rail-k">Source</span><span className="rail-v">NJDG</span></div>
                <div className="rail-row"><span className="rail-k">Cost</span><span className="rail-v">Free &amp; open</span></div>
              </div>
            )}
          </aside>
        </div>
      </div>
  );
}
