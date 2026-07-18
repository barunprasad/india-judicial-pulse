"use client";
import { useEffect, useRef, useState } from "react";

const IN = new Intl.NumberFormat("en-IN");

// The signature moment: cases are added to the national pile faster than they're cleared.
// This counts, live, how many piled up SINCE THE VISITOR OPENED THE PAGE — computed from
// the real monthly net backlog change. Honest, and impossible to feel on a static table.
export default function BacklogTicker({ netPerMonth }: { netPerMonth: number }) {
  const perSec = netPerMonth / (30 * 24 * 3600);
  const [added, setAdded] = useState(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const loop = (t: number) => {
      if (start.current == null) start.current = t;
      setAdded(((t - start.current) / 1000) * perSec);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [perSec]);

  const perMin = Math.round(perSec * 60);

  return (
    <div className="ticker" role="status" aria-live="off">
      <div className="t-num">+{IN.format(Math.floor(added))}</div>
      <div className="t-lab">
        cases added to the pile <b>since you opened this page</b>
        <br />
        that&rsquo;s about <b>{perMin} every minute</b> — more cases filed than courts can decide.
      </div>
    </div>
  );
}
