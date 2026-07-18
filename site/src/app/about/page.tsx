import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { getLatest } from "@/lib/data";

export const metadata: Metadata = {
  title: "About & method — India Judicial Pulse",
  description: "What this is, where the numbers come from, what each one means, and the limits you should keep in mind.",
};

export default function About() {
  const { meta } = getLatest();
  return (
    <>
      <div className="wrap">
        <header className="masthead">
          <p className="eyebrow">About &amp; method</p>
          <h1>How this works, in plain terms.</h1>
          <p className="lede">
            A tool about public trust has to be honest about itself. Here is exactly what you&rsquo;re
            looking at, where every number comes from, and what it can and cannot tell you.
          </p>
        </header>

        <div className="doc">
          <div className="prose">
            <h2 id="what">What this is</h2>
            <p>
              <b>India Judicial Pulse</b>{" "}is a free, public reading of the country&rsquo;s court backlog.
              The official data already exists &mdash; but it&rsquo;s shown as a snapshot of <em>this moment</em>,
              with no memory of yesterday. Our one job is to <b>keep those public numbers over time</b> and
              explain them clearly, so anyone can see not just how big the backlog is, but whether it is
              growing or shrinking. It is a public service, not a product: no ads, no sign-up, no fee.
            </p>

            <h2 id="sources">Where the numbers come from</h2>
            <p>
              Everything on the Pulse page is read from the <b>National Judicial Data Grid (NJDG)</b>, the
              official dashboard run under the Supreme Court&rsquo;s eCourts project. Courts across India feed it
              daily. NJDG publishes it as three separate dashboards &mdash; <a href="https://njdg.ecourts.gov.in/njdg_v3/" target="_blank" rel="noopener">district
              &amp; subordinate courts</a>, <a href="https://njdg.ecourts.gov.in/hcnjdg_v2/" target="_blank" rel="noopener">the
              High Courts</a>, and <a href="https://scdg.sci.gov.in/scnjdg/" target="_blank" rel="noopener">the
              Supreme Court</a> &mdash; and we read all three. We read the public page a browser would &mdash; at
              a gentle, human pace &mdash; and record what it says. We don&rsquo;t bypass any security, solve any
              CAPTCHAs, or touch private records. The raw readings are saved in the open, so anyone can check
              our numbers against the source.
            </p>
            <div className="callout">
              <p>
                The headline national figure is a <b>derived total</b>{" "}&mdash; we add the three official
                dashboard figures together; NJDG doesn&rsquo;t publish a single all-India number. We show the
                split by level so the sum is never a black box. The <b>by-age</b> chart covers district + High
                Courts only, because the Supreme Court dashboard publishes no age breakdown (it&rsquo;s about
                0.02% of the pile). A state-by-state map is being added next.
              </p>
            </div>

            <h2 id="meaning">What each number means</h2>
            <p>Plain-language definitions for everything on the Pulse page:</p>
            <ul>
              <li><b>Pending</b> &mdash; cases that have been <em>filed but not yet decided</em>. This is the backlog.</li>
              <li><b>Civil vs criminal</b>{" "}&mdash; civil cases are disputes between people or businesses
                (property, money, family); criminal cases are prosecutions by the state. Criminal cases are
                the larger, slower-moving share.</li>
              <li><b>Filed (instituted)</b>{" "}&mdash; new cases that arrived in the last month.
                <b> Decided (disposed)</b>{" "}&mdash; cases closed in the last month, by any means.</li>
              <li><b>Clearance rate</b>{" "}&mdash; decided divided by filed, as a percentage. <b>Above 100%</b> means
                courts are clearing more than arrives, so the pile shrinks; <b>below 100%</b> means it grows.</li>
              <li><b>Net change</b>{" "}&mdash; filed minus decided. A positive number is the amount the backlog
                grew that month.</li>
              <li><b>Age</b>{" "}&mdash; how long a pending case has been waiting, from filing until today. &ldquo;Over
                10 years&rdquo; cases are the hardest part of the problem.</li>
            </ul>

            <h2 id="limits">Limits &mdash; read these</h2>
            <p>Court data is powerful but imperfect. We&rsquo;d rather tell you the caveats than hide them.</p>
            <ul>
              <li><b>One month is noisy.</b> The monthly clearance rate bounces around with holidays, vacancies
                and data-entry timing. A single month can read low even when the yearly picture is healthier
                (the annual clearance rate is around 91%). <b>Trust the trend, not one reading.</b></li>
              <li><b>&ldquo;Updated on&rdquo; is not the data date.</b> NJDG shows a footer date that is a portal
                label; the actual figures move continuously. We anchor time on when <em>we</em> read the page.</li>
              <li><b>The underlying records are messy.</b> Case categories, dates and counts are entered by
                thousands of court staff and are known to contain gaps and errors. Aggregate totals are solid;
                fine detail deserves caution.</li>
              <li><b>Speed isn&rsquo;t the whole story.</b>{" "}A case can be slow for reasons outside a court&rsquo;s
                control &mdash; a stay from a higher court, a missing witness, a complex trial. Fast isn&rsquo;t
                always fair, and slow isn&rsquo;t always failure.</li>
            </ul>

            <h2 id="guardrails">What we will not do</h2>
            <div className="callout care">
              <p>
                We report on <b>systems</b>{" "}&mdash; states, districts, courts, case types &mdash; and never rank
                or profile <b>named individual judges or lawyers</b>. That isn&rsquo;t just our preference: singling
                out judges by name invites unfair comparison and is a line India&rsquo;s courts and draft AI rules
                treat as off-limits. We also mask the identities of people in sensitive cases and honour requests
                to de-index personal case details.
              </p>
            </div>

            <h2 id="built">How it&rsquo;s built</h2>
            <p>
              A small automated job reads NJDG once a day, checks the numbers for sanity, and appends one row
              to an open, versioned history file. The website is built from that file &mdash; so it&rsquo;s fast,
              costs almost nothing to run, and every number is traceable to a dated, public record. The full
              method and the raw data are open for anyone to inspect or reuse.
            </p>
            <p>
              The data and this site are free to read, quote and share. If you&rsquo;re a journalist, researcher,
              or just a curious citizen, that&rsquo;s exactly who it&rsquo;s for &mdash; please link back so others
              can check the source too.
            </p>
          </div>

          <aside className="doc-rail">
            <div className="rail">
              <p className="rail-h">In this report</p>
              <nav className="rail-toc">
                <a href="#what">What this is</a>
                <a href="#sources">Where the numbers come from</a>
                <a href="#meaning">What each number means</a>
                <a href="#limits">Limits</a>
                <a href="#guardrails">What we will not do</a>
                <a href="#built">How it&rsquo;s built</a>
              </nav>
            </div>
            <div className="rail">
              <p className="rail-h">At a glance</p>
              <div className="rail-row"><span className="rail-k">Source</span><span className="rail-v">NJDG (official)</span></div>
              <div className="rail-row"><span className="rail-k">Scope</span><span className="rail-v">All court levels</span></div>
              <div className="rail-row"><span className="rail-k">Refreshed</span><span className="rail-v">Daily</span></div>
              <div className="rail-row"><span className="rail-k">Cost</span><span className="rail-v">Free &amp; open</span></div>
              <div className="rail-row"><span className="rail-k">For</span><span className="rail-v">Anyone</span></div>
            </div>
          </aside>
        </div>
      </div>
      <Footer fetchedAt={meta.fetched_at} sources={meta.sources} />
    </>
  );
}
