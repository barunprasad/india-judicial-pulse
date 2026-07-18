import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { getLatest } from "@/lib/data";

export const metadata: Metadata = {
  title: "Why cases stall",
  description:
    "A backlog isn't one big number — it's millions of individual pauses, most for a handful of recurring reasons. A plain-language explainer of what actually slows a case down in India.",
};

export default function WhyPage() {
  const { meta } = getLatest();
  return (
    <>
      <div className="wrap">
        <header className="masthead">
          <p className="eyebrow">Why &middot; the anatomy of a delay</p>
          <h1>Why are cases stuck?</h1>
          <p className="lede">
            A backlog isn&rsquo;t one big number &mdash; it&rsquo;s millions of individual pauses, most of them
            for a surprisingly small set of recurring reasons. Once you can name them, &ldquo;the courts are
            slow&rdquo; stops being a shrug and becomes something specific.
          </p>
        </header>

        <div className="doc">
          <div className="prose">
            <h2 id="pauses">A case moves in hearings &mdash; and stops between them</h2>
            <p>
              A case doesn&rsquo;t run continuously. It advances hearing by hearing, and between each one it
              waits. When a hearing doesn&rsquo;t move things forward, the case is simply <em>adjourned</em>{" "}to a
              later date &mdash; often weeks or months away, because the court&rsquo;s calendar is full. Stack up
              enough of those pauses and a matter that should take months takes years. The backlog is the sum of
              all those waits.
            </p>

            <h2 id="reasons">The recurring reasons</h2>
            <p>Most delays trace back to a handful of causes that repeat across the country:</p>
            <ul>
              <li><b>&ldquo;More time, please.&rdquo;</b>{" "}One side asks for an adjournment &mdash; to prepare, to
                brief a new lawyer, or simply as a tactic when delay suits them. It is the single most common way
                a hearing ends without progress.</li>
              <li><b>Witnesses don&rsquo;t turn up.</b>{" "}Trials stall when witnesses can&rsquo;t be found,
                won&rsquo;t come, or are called and sent home unheard because the day ran out.</li>
              <li><b>The accused is absent or absconding.</b>{" "}A criminal case can&rsquo;t proceed if the person on
                trial isn&rsquo;t produced or has disappeared &mdash; a large share of the oldest criminal
                pendency.</li>
              <li><b>The paperwork hasn&rsquo;t arrived.</b>{" "}Notices and summons that never reach the other party,
                records still being called for, reports awaited from police or experts &mdash; each sends the
                case to a new date.</li>
              <li><b>A higher court has hit pause.</b>{" "}An appeal or a <b>stay</b>{" "}order freezes a matter, sometimes
                for years, while a court above decides a related question.</li>
              <li><b>No courtroom to hear it in.</b>{" "}When the judge&rsquo;s seat is vacant or the day is
                overbooked, even a ready case waits &mdash; not for any fault of the parties.</li>
            </ul>

            <h2 id="squeeze">The structural squeeze behind it all</h2>
            <p>
              Those day-to-day reasons sit on top of a deeper one: there are not enough judges. India runs well
              below its own sanctioned judicial strength, with seats lying vacant for months at a time, while
              filings keep arriving. On this site you can already watch that imbalance directly &mdash; when
              cases are filed faster than they&rsquo;re decided, the <b>clearance rate</b>{" "}drops below 100% and
              the pile grows. Delay isn&rsquo;t only about any one hearing; it&rsquo;s about a system carrying
              more than it was built to.
            </p>

            <h2 id="cost">Who pays for the wait</h2>
            <div className="callout care">
              <p>
                The sharpest cost is borne by <b>undertrials</b>{" "}&mdash; people held in jail while their case is
                still being decided, not convicted of anything. By the government&rsquo;s own prison statistics
                (National Crime Records Bureau), they are the large majority of India&rsquo;s prison population.
                For them, a delayed case isn&rsquo;t an abstraction on a dashboard; it is time that cannot be
                given back.
              </p>
            </div>
            <p>
              Reframing the story from <em>how many</em>{" "}cases to <em>why</em>{" "}they wait &mdash; and who waits
              with them &mdash; is the thing no official dashboard does. It is a large part of why this project
              exists.
            </p>

            <h2 id="next">What this page will add next</h2>
            <p>
              NJDG records a coded reason each time a case is adjourned. Turning those codes into an honest,
              national tally of <em>why</em>{" "}hearings don&rsquo;t advance &mdash; the way the home page already
              tallies <em>how many</em>{" "}&mdash; is the next data feed we&rsquo;re building. Until it&rsquo;s in
              and checked, this page is the plain-language map, not a live count &mdash; and we&rsquo;d rather say
              so than show numbers we haven&rsquo;t verified.
            </p>
          </div>

          <aside className="doc-rail">
            <div className="rail">
              <p className="rail-h">The mechanics</p>
              <nav className="rail-toc">
                <a href="#pauses">Hearings &amp; pauses</a>
                <a href="#reasons">The recurring reasons</a>
                <a href="#squeeze">The structural squeeze</a>
                <a href="#cost">Who pays for the wait</a>
                <a href="#next">What&rsquo;s coming</a>
              </nav>
            </div>
            <div className="rail">
              <p className="rail-h">Honest status</p>
              <div className="rail-row"><span className="rail-k">This page</span><span className="rail-v">Explainer</span></div>
              <div className="rail-row"><span className="rail-k">Live counts</span><span className="rail-v">In progress</span></div>
              <div className="rail-row"><span className="rail-k">Numbers</span><span className="rail-v">None invented</span></div>
            </div>
          </aside>
        </div>
      </div>
      <Footer fetchedAt={meta.fetched_at} sources={meta.sources} />
    </>
  );
}
