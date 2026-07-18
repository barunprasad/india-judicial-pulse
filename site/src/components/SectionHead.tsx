import type { ReactNode } from "react";

// Section header: an accent-outline pill kicker, a bold title (with .serif emphasis), a lede.
export default function SectionHead({
  kicker,
  title,
  lede,
}: {
  index?: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <div className="sec-head" data-animate>
      <span className="kickpill">{kicker}</span>
      <h2 className="h2">{title}</h2>
      {lede ? <p className="sec-lede">{lede}</p> : null}
    </div>
  );
}
