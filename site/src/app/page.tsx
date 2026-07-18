import { getLatest, getHistory } from "@/lib/data";
import { fmtWhen } from "@/lib/format";
import Band from "@/components/Band";
import Hero from "@/components/Hero";
import SectionHead from "@/components/SectionHead";
import StatStrip from "@/components/StatStrip";
import AgeChart from "@/components/AgeChart";
import Trend from "@/components/Trend";
import IndexRow from "@/components/IndexRow";
import CountUp from "@/components/CountUp";
import Levels from "@/components/Levels";

// A subtle, treated backdrop for the cover — a law-archive of books, heavily dimmed.
// (The footer's "Listen." wall lives in the root layout, shared across all pages.)
const IMG_ARCHIVE = "https://images.unsplash.com/photo-1632684140995-27b3244734af?w=1600&q=60&auto=format&fit=crop";

export default function Pulse() {
  const { meta, national: r, levels } = getLatest();
  const history = getHistory();

  return (
    <>
      {/* COVER — dark, centred, data as the hero */}
      <Band cover label="Cases pending now" bg={IMG_ARCHIVE}>
        <header className="masthead">
          <p className="eyebrow" data-animate>National Judicial Data Grid &middot; District, High Court &amp; Supreme Court</p>
          <h1 data-animate>The national court backlog, <span className="serif">day by day</span>.</h1>
          <p className="lede" data-animate>
            Across every level of India&rsquo;s courts sits a backlog so large it is hard to picture. This page
            adds up the official numbers, in plain language, and shows you not just how big the pile is
            &mdash; but which way it is moving.
          </p>
          <div className="statusbar" data-animate>
            <span className="live"><span className="dot" /> reading from NJDG</span>
            <span className="tag num">{fmtWhen(meta.fetched_at)}</span>
          </div>
        </header>
        <Hero record={r} />
      </Band>

      {/* THE COURT LEVELS — where the national total comes from (machine-style 3-col) */}
      <Band label="Across the three court levels">
        <SectionHead
          index="01"
          kicker="Where they sit"
          title={<>One pile, <span className="serif">three</span> court levels.</>}
          lede="The national total isn't one figure — it's summed from NJDG's three official dashboards. Here is exactly how the pile splits across them, so the number is never a black box."
        />
        <Levels levels={levels} nationalTotal={r.pending.total} />
      </Band>

      {/* THE FLOW — dark */}
      <Band label="Is the country keeping up?">
        <SectionHead
          index="02"
          kicker="The flow"
          title={<>Is the country <span className="serif">keeping up?</span></>}
          lede="A court system is healthy when it decides cases at least as fast as new ones arrive. These four readings tell you whether that is happening."
        />
        <StatStrip record={r} />
      </Band>

      {/* THE DEPTH — dark showcase, contrast from a faint technical grid */}
      <Band grid label="The shape of the backlog">
        <SectionHead
          index="03"
          kicker="The depth"
          title={<>How <span className="serif">stuck</span> is the backlog?</>}
          lede="The backlog isn't one thing — it's fresh cases on top of a deep, old core. Where it sits, and which way the whole pile is drifting, is the real story."
        />
        <div className="cols wide">
          <div data-animate>
            <div className="block-head">
              <div><h3>By age</h3><p className="block-note">district + High Court cases, grouped &middot; hover a bar</p></div>
              <div className="mini-legend">
                <span><span className="sw" style={{ background: "var(--civil)" }} /> Civil</span>
                <span><span className="sw" style={{ background: "var(--criminal)" }} /> Criminal</span>
              </div>
            </div>
            <AgeChart ageProfile={r.age_profile} />
            <p className="figcap">Fig. 1 &mdash; Pending cases by age (district + High Courts), split civil / criminal.</p>
          </div>
          <div data-animate>
            <div className="block-head"><div><h3>Over time</h3><p className="block-note">total pending, day by day</p></div></div>
            <p className="block-lede">A single number can&rsquo;t tell you if things are improving. Watching it accumulate can &mdash; that&rsquo;s the whole point of this project.</p>
            <Trend history={history} />
            <p className="figcap">Fig. 2 &mdash; Total pending, one point per daily reading.</p>
          </div>
        </div>
      </Band>

      {/* THE PEOPLE — dark */}
      <Band label="The people behind it">
        <SectionHead
          index="04"
          kicker="The people"
          title={<>Who is <span className="serif">waiting</span>, and what&rsquo;s next</>}
          lede="Behind every number is a person. Two questions this page can't answer yet — and will."
        />
        <div className="cols even">
          <div data-animate>
            <div className="block-head"><div><h3>Who is waiting?</h3><p className="block-note">pending cases filed by these groups</p></div></div>
            <div className="demo" style={{ marginTop: 22 }}>
              <div><div className="d-lab">Filed by women</div><div className="d-val"><CountUp value={r.litigants.women_filed} /></div><div className="d-sub">pending cases</div></div>
              <div><div className="d-lab">Filed by senior citizens</div><div className="d-val"><CountUp value={r.litigants.senior_citizen_filed} /></div><div className="d-sub">pending cases</div></div>
            </div>
          </div>
          <div>
            <div className="block-head" data-animate><div><h3>Coming next</h3><p className="block-note">what this becomes</p></div></div>
            <div className="index">
              <IndexRow n="01" href="/map" name="Where is it worst?" desc="A map, drillable to your own district." meta="Map · districts" />
              <IndexRow n="02" href="/why" name="Why are cases stuck?" desc="Adjournments, missing witnesses, higher-court stays." meta="Delays" />
            </div>
          </div>
        </div>
      </Band>
    </>
  );
}
