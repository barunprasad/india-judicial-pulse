import type { Metadata } from "next";
import Planned from "@/components/Planned";

export const metadata: Metadata = { title: "Look up your case — India Judicial Pulse" };

export default function CasePage() {
  return (
    <Planned
      eyebrow="Your case · one record at a time"
      title="Look up your own case"
      lede="The national picture is made of millions of individual cases — including, perhaps, yours. This will let you look one up and understand its story."
    >
      <h2>What&rsquo;s coming</h2>
      <p>
        Enter a case&rsquo;s 16-character <b>CNR number</b>{" "}and see it in plain terms: how long it has been
        running, how many times it has been heard, when it&rsquo;s next listed, and which court is handling it.
        It turns a wall of legal jargon into a clear timeline.
      </p>
      <div className="callout">
        <p>
          One honest limit up front: we can show the <b>advocates on record</b>, but the public system
          doesn&rsquo;t keep a complete history of every lawyer who ever worked on a matter &mdash; so we
          won&rsquo;t pretend to.
        </p>
      </div>
      <p>
        This is the one feature that looks a case up live, one at a time, exactly as the official portal
        intends &mdash; with the security check solved by you, the person asking. No bulk collection, no
        shortcuts.
      </p>
    </Planned>
  );
}
