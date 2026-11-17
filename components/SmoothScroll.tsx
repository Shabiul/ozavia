"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { scroll } from "@/lib/scroll-store";

gsap.registerPlugin(ScrollTrigger, SplitText);

// One place wires everything scroll-related:
//  [data-track="key"]  -> scroll.p[key] progress for the 3D scene
//  [data-tint="#hex"]  -> page tint while the section is centred
//  [data-reveal]       -> masked line reveal on enter
export function SmoothScroll() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: Lenis | undefined;
    const raf = (t: number) => lenis?.raf(t * 1000);
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.09 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    const onPointer = (e: PointerEvent) => {
      scroll.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      scroll.pointer.y = (e.clientY / innerHeight) * 2 - 1;
    };
    addEventListener("pointermove", onPointer, { passive: true });

    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>("[data-track]").forEach((el) => {
        const key = el.dataset.track!;
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => (scroll.p[key] = self.progress),
          onRefresh: (self) => (scroll.p[key] = self.progress),
        });
      });

      document.querySelectorAll<HTMLElement>("[data-tint]").forEach((el) => {
        const to = (c: string) => {
          scroll.tint = c;
          gsap.to("html", { "--tint": c, duration: 1.1, ease: "power2.out", overwrite: true });
        };
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => to(el.dataset.tint!),
          onEnterBack: () => to(el.dataset.tint!),
        });
      });

      if (!reduced) {
        document.fonts.ready.then(() => {
          ctx.add(() => {
            document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
              const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line" });
              gsap.from(split.lines, {
                yPercent: 110,
                duration: 1.1,
                ease: "expo.out",
                stagger: 0.08,
                scrollTrigger: { trigger: el, start: "top 88%" },
              });
            });
            ScrollTrigger.refresh();
          });
        });
      }
    });

    return () => {
      removeEventListener("pointermove", onPointer);
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
