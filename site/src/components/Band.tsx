import type { ReactNode } from "react";

// A full-bleed section band. `grid` lays a faint technical grid behind the content
// (the dark showcase treatment); `bg` sets a subtle, treated backdrop image instead.
export default function Band({
  grid,
  cover,
  id,
  label,
  bg,
  className = "",
  children,
}: {
  grid?: boolean;
  cover?: boolean;
  id?: string;
  label?: string;
  bg?: string;
  className?: string;
  children: ReactNode;
}) {
  const cls = ["band", cover ? "cover" : "", className].filter(Boolean).join(" ");
  return (
    <section id={id} className={cls} aria-label={label}>
      {grid ? <div className="band-grid-layer" aria-hidden="true" /> : null}
      {bg ? <div className="band-bg" style={{ backgroundImage: `url("${bg}")` }} aria-hidden="true" /> : null}
      <div className="wrap">{children}</div>
    </section>
  );
}
