// Mutable, read every frame by the 3D scene; never triggers React renders.
export const scroll = {
  p: {} as Record<string, number>, // per-section progress 0..1 (section top at viewport bottom -> section bottom at viewport top)
  pointer: { x: 0, y: 0 },         // -1..1
  tint: "#14160f",                  // current chapter colour, mirrored to the canvas backdrop
};
export const sp = (key: string) => scroll.p[key] ?? 0;
