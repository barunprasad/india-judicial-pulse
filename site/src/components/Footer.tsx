import { Info } from "@phosphor-icons/react/dist/ssr";
import { fmtWhen } from "@/lib/format";

// Honesty lives in the footer of every page — it's part of the product, not fine print.
export default function Footer({
  fetchedAt,
  sources,
  bg,
}: {
  fetchedAt?: string;
  sources?: { level: string; url: string }[];
  bg?: string;
}) {
  const primary = sources?.[0]?.url ?? "https://njdg.ecourts.gov.in/njdg_v3/";
  return (
    <footer className="foot band-ink">
      {bg ? <div className="band-bg" style={{ backgroundImage: `url("${bg}")` }} aria-hidden="true" /> : null}
      <div className="wrap">
        <p className="src">
          Sources: the three official <a href={primary} target="_blank" rel="noopener">NJDG &mdash; National Judicial
          Data Grid</a> dashboards &mdash; district, High Court and Supreme Court. The national figure is their sum.
          Read {fetchedAt ? fmtWhen(fetchedAt) : ""}.
          Free &amp; open &middot; not for use as legal evidence. &middot; Imagery via <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a>.
        </p>
        <div className="caveats">
          <p className="cav"><span className="ic"><Info size={15} /></span><span>
            The <b>monthly clearance rate</b>{" "}is a single-month figure and swings around &mdash; read the
            <em> trend</em> across days, not any one month. Measured over a full year the rate is higher (~91%).
          </span></p>
          <p className="cav"><span className="ic"><Info size={15} /></span><span>
            Time is anchored on when we read the page (<code>fetched_at</code>). NJDG&rsquo;s own
            &ldquo;Updated on&rdquo; footer is a portal label, not a reliable data date.
          </span></p>
          <p className="cav"><span className="ic"><Info size={15} /></span><span>
            The headline is a <b>derived national total</b>{" "}&mdash; the sum of three official NJDG figures
            (district, High Court, Supreme Court), not a single published number. The <em>by-age</em> chart
            covers district + High Courts only (the Supreme Court dashboard publishes no age split &mdash; about
            0.02% of the pile). Per-state views are being added.
          </span></p>
          <p className="cav"><span className="ic"><Info size={15} /></span><span>
            We report on <b>systems</b>{" "}&mdash; states, districts, courts &mdash; never on named individual
            judges or lawyers. Court data is noisy; we flag it rather than hide it.
          </span></p>
        </div>
      </div>
    </footer>
  );
}
