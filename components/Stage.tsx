"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { Wordmark } from "./Wordmark";

const Experience = dynamic(() => import("./scene/Experience"), { ssr: false });

function can3D() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // narrow low-memory devices get the rendered stills instead
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (innerWidth < 768 && mem !== undefined && mem < 4) return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

// Decides 3D vs static fallback, mounts the canvas, and shows the preloader.
export function Stage() {
  const [mode, setMode] = useState<"3d" | "static" | null>(null);
  const { progress, active } = useProgress();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const m = can3D() ? "3d" : "static";
    document.documentElement.dataset.mode = m;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser capability is only knowable after mount
    setMode(m);
  }, []);

  const ready = mode === "static" || (mode === "3d" && progress >= 100 && !active);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setGone(true), 1400);
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <>
      {mode === "3d" && (
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
          <Experience />
        </div>
      )}
      {!gone && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0c0d09] transition-opacity duration-1000 ${ready ? "pointer-events-none opacity-0" : ""}`}
          role="status"
          aria-label="Loading"
        >
          <Wordmark className="gold-text text-6xl md:text-8xl" />
          <p className="eyebrow mt-4">Premium Spices</p>
          <div className="mt-10 h-px w-56 bg-cream/15">
            <div className="h-px bg-gold transition-[width] duration-300" style={{ width: `${mode === "static" ? 100 : progress}%` }} />
          </div>
        </div>
      )}
    </>
  );
}
