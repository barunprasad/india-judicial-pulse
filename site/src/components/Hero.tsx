import { human } from "@/lib/format";
import type { CourtRecord } from "@/lib/types";
import CountUp from "@/components/CountUp";
import BacklogTicker from "@/components/BacklogTicker";
import SplitBar from "@/components/SplitBar";

// The hero — data as the star. Centred. The number is the product shot.
export default function Hero({ record }: { record: CourtRecord }) {
  const P = record.pending;
  const lm = record.last_month;
  return (
    <div className="hero">
      <p className="eyebrow" data-animate>Cases pending right now</p>
      <div className="hero-num" data-animate><CountUp value={P.total} /></div>
      <p className="hero-approx num" data-animate>that&rsquo;s about {human(P.total)} cases</p>
      <p className="hero-cap" data-animate>
        A <b style={{ color: "var(--ink)" }}>pending</b>{" "}case is one filed but not yet decided. This is the
        country&rsquo;s entire court backlog &mdash; district, High Court and Supreme Court &mdash; in one number.
      </p>
      <div data-animate><BacklogTicker netPerMonth={lm.net_backlog_change} /></div>
      <div data-animate><SplitBar total={P.total} civil={P.civil} criminal={P.criminal} centered /></div>
    </div>
  );
}
