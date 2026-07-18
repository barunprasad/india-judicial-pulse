"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Smooth scroll (Lenis) + scroll-reveal (GSAP ScrollTrigger). Every [data-animate] element
// rises + fades in as it enters the viewport. Fully skipped for reduced-motion users.
export default function ScrollFX() {
  const path = usePathname();

  // Lenis smooth scroll — set up once, driven by GSAP's ticker.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // Reveal animations — re-armed whenever the route (and thus the DOM) changes.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-animate]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 28,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [path]);

  return null;
}
