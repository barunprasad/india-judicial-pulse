"use client";
import { useEffect, useRef, useState } from "react";

const IN = new Intl.NumberFormat("en-IN");

type Props = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
};

// Counts up to `value` on first view. Renders the final value server-side (works with no
// JS), animates on the client unless the visitor prefers reduced motion.
export default function CountUp({ value, decimals = 0, prefix = "", suffix = "", duration = 1100 }: Props) {
  const [n, setN] = useState<number>(value);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    const run = () => {
      if (started.current) return;
      started.current = true;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(value * eased);
        if (p < 1) requestAnimationFrame(tick);
        else setN(value);
      };
      setN(0);
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.2 },
    );
    if (el) io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  const shown = decimals ? Number(n).toFixed(decimals) : IN.format(Math.round(n));
  return <span ref={ref} className="num">{prefix}{shown}{suffix}</span>;
}
