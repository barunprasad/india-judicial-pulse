"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Smooth scroll (Lenis) + scroll-reveal (GSAP ScrollTrigger). Every [data-animate] element
// rises + fades in as it enters the viewport. Fully skipped for reduced-motion users.
export default function ScrollFX() {
  const path = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const firstRender = useRef(true);

  // Lenis smooth scroll — set up once, driven by GSAP's ticker.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // On route change, jump to the top. Lenis owns the scroll position, so Next's own
  // scroll-to-top gets overridden unless we reset Lenis's target too. Skip the first
  // render so a deep-linked #hash still lands where it should.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [path]);

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
