import type { Metadata } from "next";
import Planned from "@/components/Planned";

export const metadata: Metadata = { title: "Why cases stall — India Judicial Pulse" };

export default function WhyPage() {
  return (
    <Planned
      eyebrow="Why · what stalls a case"
      title="Why are cases stuck?"
      lede="A backlog isn't just a big number — it's millions of individual delays, most of them for a handful of recurring reasons. This is the story the raw counts never tell."
    >
      <h2>What&rsquo;s coming</h2>
      <p>
        NJDG records <em>why</em>{" "}hearings don&rsquo;t move a case forward, and the pattern is stark. Across
        pending cases, the biggest recorded reasons include <b>lawyers seeking more time</b>, <b>witnesses
        not appearing</b>, <b>accused persons absent or absconding</b>, and <b>stays from higher courts</b>.
        This page will surface those reasons plainly, so &ldquo;the courts are slow&rdquo; becomes something
        specific you can actually understand.
      </p>
      <div className="callout care">
        <p>
          It will also show the human cost that hides behind the backlog &mdash; for example, people held in
          jail as <b>undertrials</b>, still waiting for a verdict. A delayed case is not an abstraction for them.
        </p>
      </div>
      <p>
        Reframing from <em>how many</em> to <em>why</em>{" "}is the thing no official dashboard does &mdash; and
        the reason this project exists.
      </p>
    </Planned>
  );
}
