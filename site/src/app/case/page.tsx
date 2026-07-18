import type { Metadata } from "next";
import Footer from "@/components/Footer";
import CnrLookup from "@/components/CnrLookup";
import { getLatest } from "@/lib/data";

export const metadata: Metadata = {
  title: "Look up your case",
  description:
    "Enter a 16-character CNR number and jump straight to the official eCourts record for a single case. No bulk collection — the live lookup happens on the government portal, where you solve the security check yourself.",
};

export default function CasePage() {
  const { meta } = getLatest();
  return (
    <>
      <div className="wrap">
        <header className="masthead">
          <p className="eyebrow">Your case &middot; one record at a time</p>
          <h1>Look up a single case.</h1>
          <p className="lede">
            The national picture is made of millions of individual cases &mdash; including, perhaps, one of
            yours. Every case has a permanent 16-character <b>CNR number</b>. Paste it below and we&rsquo;ll take
            you straight to its official record.
          </p>
        </header>

        <div className="doc">
          <div className="prose">
            <CnrLookup />

            <h2 id="how">How this works</h2>
            <p>
              Unlike the rest of this site &mdash; which reads public totals in bulk &mdash; a single case is
              looked up <b>live, one at a time, on the official portal</b>, exactly as it&rsquo;s meant to be.
              We don&rsquo;t fetch, cache, or store your case. We only check that the CNR is well-formed, copy it
              for you, and open the eCourts case-status page in a new tab. The final security check is solved by
              you, the person asking.
            </p>
            <ol>
              <li>Paste the 16-character CNR above and press <b>Look it up</b>.</li>
              <li>The official <b>eCourts</b>{" "}case-status page opens in a new tab, with your CNR copied to the
                clipboard.</li>
              <li>Paste it into the <b>&ldquo;CNR Number&rdquo;</b>{" "}box, complete the on-screen security check,
                and view the record: filing date, every hearing so far, the next listed date, the stage, and the
                court hearing it.</li>
            </ol>

            <h2 id="cnr">What&rsquo;s a CNR, and where do I find it?</h2>
            <p>
              The <b>Case Number Record (CNR)</b>{" "}is a unique 16-character code &mdash; letters and digits, no
              spaces &mdash; assigned to every case in the district and taluka courts the moment it&rsquo;s
              filed. It never changes, even if the case is transferred or renumbered. You&rsquo;ll find it on any
              hearing notice or order sheet, or by searching your name or case number on the same eCourts portal.
            </p>

            <div className="callout">
              <p>
                One honest limit up front: the record shows the <b>advocates currently on record</b>, but the
                public system doesn&rsquo;t keep a full history of every lawyer who ever touched a matter &mdash;
                so we won&rsquo;t pretend to.
              </p>
            </div>

            <div className="callout care">
              <p>
                This tool is for understanding a case, not for building a database of people. We don&rsquo;t
                collect case records in bulk, and we report on <b>systems</b>{" "}&mdash; courts, districts, case
                types &mdash; never on named individuals.
              </p>
            </div>
          </div>

          <aside className="doc-rail">
            <div className="rail">
              <p className="rail-h">On this page</p>
              <nav className="rail-toc">
                <a href="#how">How this works</a>
                <a href="#cnr">What&rsquo;s a CNR?</a>
              </nav>
            </div>
            <div className="rail">
              <p className="rail-h">At a glance</p>
              <div className="rail-row"><span className="rail-k">Lookup</span><span className="rail-v">Live, on eCourts</span></div>
              <div className="rail-row"><span className="rail-k">We store</span><span className="rail-v">Nothing</span></div>
              <div className="rail-row"><span className="rail-k">Security check</span><span className="rail-v">You solve it</span></div>
              <div className="rail-row"><span className="rail-k">Scope</span><span className="rail-v">District courts</span></div>
            </div>
          </aside>
        </div>
      </div>
      <Footer fetchedAt={meta.fetched_at} sources={meta.sources} />
    </>
  );
}
