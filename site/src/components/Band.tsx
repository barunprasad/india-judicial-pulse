import type { ReactNode } from "react";

// A full-bleed section band. `light` flips it to a light ground; `bg` sets a subtle,
// treated (dim, desaturated, masked) backdrop image behind the content.
export default function Band({
  light,
  cover,
  id,
  label,
  bg,
  className = "",
  children,
}: {
  light?: boolean;
  cover?: boolean;
  id?: string;
  label?: string;
  bg?: string;
  className?: string;
  children: ReactNode;
}) {
  const cls = ["band", light ? "band-light" : "", cover ? "cover" : "", className].filter(Boolean).join(" ");
  return (
    <section id={id} className={cls} aria-label={label}>
      {bg ? <div className="band-bg" style={{ backgroundImage: `url("${bg}")` }} aria-hidden="true" /> : null}
      <div className="wrap">{children}</div>
    </section>
  );
}
