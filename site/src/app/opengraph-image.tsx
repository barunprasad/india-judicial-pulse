import { ImageResponse } from "next/og";
import { getLatest } from "@/lib/data";
import { grp, human } from "@/lib/format";
import { SITE } from "@/lib/site";

// The share card — data as the hero, generated at build. Whatever the latest reading is,
// that's the number people see when the link is pasted anywhere.
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} — India's court backlog, kept over time`;

export default function OpengraphImage() {
  const { national } = getLatest();
  const total = national.pending.total;
  const bg = "#08090c";
  const ink = "#f4f6f8";
  const ink2 = "#a2a8b4";
  const ink3 = "#697079";
  const accent = "#20d5f9";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: bg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: ink,
        }}
      >
        {/* brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 30 }}>
            {[16, 28, 20, 30, 18].map((h, i) => (
              <div key={i} style={{ width: 5, height: h, background: accent, borderRadius: 3 }} />
            ))}
          </div>
          <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: -0.5 }}>{SITE.name}</div>
        </div>

        {/* hero number */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 22, letterSpacing: 6, color: ink3, textTransform: "uppercase" }}>
            Cases pending now · all court levels
          </div>
          <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -6, lineHeight: 1, marginTop: 14 }}>
            {grp(total)}
          </div>
          <div style={{ fontSize: 30, color: accent, marginTop: 18 }}>{`that's about ${human(total)} cases`}</div>
        </div>

        {/* footer strip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, color: ink2 }}>Read from NJDG · kept day by day · free &amp; open</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, color: ink3 }}>
            <div style={{ width: 10, height: 10, borderRadius: 10, background: accent }} />
            District · High Court · Supreme Court
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
