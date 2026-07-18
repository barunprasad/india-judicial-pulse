import { Info } from "@phosphor-icons/react/dist/ssr";
import { fmtWhen } from "@/lib/format";

// Honesty lives in the footer of every page — it's part of the product, not fine print.
export default function Footer({
  fetchedAt,
  url = "https://njdg.ecourts.gov.in/njdg_v3/",
  bg,
}: {
  fetchedAt?: string;
  url?: string;
  bg?: string;
}) {
  return (
    <footer className="foot band-ink">
      {bg ? <div className="band-bg" style={{ backgroundImage: `url("${bg}")` }} aria-hidden="true" /> : null}
      <div className="wrap">
        <p className="src">
          Source: <a href={url} target="_blank" rel="noopener">NJDG &mdash; National Judicial Data Grid</a>,
          the eCourts project&rsquo;s official public dashboard. Read {fetchedAt ? fmtWhen(fetchedAt) : ""}.
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
            Scope is <b>district &amp; subordinate courts</b>{" "}&mdash; India&rsquo;s trial courts, where the great
            majority of cases live. High Courts, the Supreme Court and per-state views are being added.
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
