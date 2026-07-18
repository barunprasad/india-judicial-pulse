import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

// A numbered index row (Wibify-style): number · name + description · meta · arrow.
export default function IndexRow({
  n,
  href,
  name,
  desc,
  meta,
}: {
  n: string;
  href: string;
  name: string;
  desc: string;
  meta: string;
}) {
  return (
    <Link href={href} className="index-row" data-animate>
      <span className="ix-n">{n}</span>
      <div className="ix-body">
        <div className="ix-name">{name}</div>
        <span className="ix-desc">{desc}</span>
      </div>
      <span className="ix-meta">{meta}</span>
      <ArrowUpRight size={18} className="ix-arrow" />
    </Link>
  );
}
