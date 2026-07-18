"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { PulseIcon, MapTrifoldIcon, HourglassIcon, FileTextIcon, InfoIcon } from "@phosphor-icons/react/dist/ssr";

type IconCmp = ComponentType<{ size?: number; weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone" }>;
type NavLink = { href: string; label: string; Icon: IconCmp };

export const LINKS: NavLink[] = [
  { href: "/", label: "Pulse", Icon: PulseIcon },
  { href: "/map", label: "Where", Icon: MapTrifoldIcon },
  { href: "/why", label: "Why", Icon: HourglassIcon },
  { href: "/case", label: "Case", Icon: FileTextIcon },
  { href: "/about", label: "About", Icon: InfoIcon },
];

const isCurrent = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

export function NavDesktop() {
  const path = usePathname();
  return (
    <nav className="nav-desk" aria-label="Primary">
      {LINKS.map(({ href, label }) => (
        <Link key={href} href={href} aria-current={isCurrent(path, href) ? "page" : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function NavMobile() {
  const path = usePathname();
  return (
    <nav className="nav-mob" aria-label="Primary">
      {LINKS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-current={isCurrent(path, href) ? "page" : undefined}>
          <Icon size={20} weight="regular" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
