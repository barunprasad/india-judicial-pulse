import type { Metadata } from "next";
import Planned from "@/components/Planned";

export const metadata: Metadata = { title: "Where — India Judicial Pulse" };

export default function MapPage() {
  return (
    <Planned
      eyebrow="Where · states & districts"
      title="Where is the backlog worst?"
      lede="The national number hides enormous variation. Some districts clear cases quickly; others are years behind. This view will let you find your own."
    >
      <h2>What&rsquo;s coming</h2>
      <p>
        A map of India you can drill into &mdash; state, then district, then court complex &mdash; shaded by
        the measure you care about: total pending, clearance rate, the share of very old cases, or, most
        fairly, <b>cases per person</b>. On a phone it becomes a ranked list you can scan and tap.
      </p>
      <p>
        It will also show <b>who is moving</b>: which places improved and which slipped since last month &mdash;
        the kind of thing a once-a-year report can never surface.
      </p>
      <div className="callout">
        <p>
          To be fair, a place can&rsquo;t be judged on raw speed alone. We&rsquo;ll show each district next to
          its <b>judge vacancies</b> and <b>population</b>, so an overloaded court isn&rsquo;t mistaken for a
          lazy one.
        </p>
      </div>
      <p>
        This needs a second, heavier data feed than the national page &mdash; one that walks NJDG&rsquo;s
        state-and-district drill-down. That feed is already built and tested; wiring it into a live map is
        the next milestone.
      </p>
    </Planned>
  );
}
