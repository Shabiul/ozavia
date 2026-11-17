# Ozavia 3D Landing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single-page Awwwards-grade 3D landing site for Ozavia Premium Spices with four heritage chapters and an enquiry form.

**Architecture:** Next.js App Router page with one fixed react-three-fiber canvas behind DOM sections. GSAP ScrollTrigger (driven by Lenis) writes scroll progress into a shared store that the scene reads each frame. Models are scripted in Blender and exported as Draco GLB.

**Tech Stack:** Next.js (TypeScript, Tailwind), three, @react-three/fiber, @react-three/drei, @react-three/postprocessing, gsap, lenis, Blender 5.4 (headless Python).

**Spec:** `docs/superpowers/specs/2026-11-17-ozavia-landing-design.md`

## Global Constraints

- Project root `D:\NIITMTS-main\ozavia`. Touch nothing outside it (scratch files excepted).
- Blender binary: `E:\NoHesiInstaller\java\blender-5.4.0-alpha+main.6f4fc760c138-windows.amd64-release\blender-5.4.0-alpha+main.6f4fc760c138-windows.amd64-release\blender.exe`, run headless: `blender.exe -b --python blender/<script>.py`.
- Heritage copy is real spice history only; no invented claims about Ozavia's founders, farms, age or awards.
- No e-commerce: no cart, prices, checkout.
- Palette: olive black `#14160f`, box olive `#3a3f2a`, foil gold `#c9a45c`, cream `#efe6d2`; Garam `#8e2a22`, Biryani `#4d5a2c`, Elite `#1f3358`, Pili Mirch `#c8601c`.
- Masala ids, in order: `garam`, `biryani`, `elite`, `pili`.
- Parallel agents do NOT run git commands or `npm install`; the orchestrator commits and owns `package.json`.
- GLB convention: Y up, 1 unit = 10 cm, object origins as stated per asset, Draco compressed, transforms applied.

---

## Wave 0 — orchestrator, before dispatch

### Task 0: Scaffold
- [ ] `npx create-next-app@latest . --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm --yes`
- [ ] `npm i three @react-three/fiber @react-three/drei @react-three/postprocessing gsap lenis` and `npm i -D @types/three`
- [ ] Create `content/masalas.ts` with the `Masala` type below and stub data; commit.

```ts
export type MasalaId = "garam" | "biryani" | "elite" | "pili";
export type Masala = {
  id: MasalaId;
  name: string;          // "Garam Masala"
  color: string;         // chapter hex from Global Constraints
  spiceColor: string;    // hex of the powder inside the jar
  hook: string;          // one line, <= 12 words
  era: string;           // short label, e.g. "Mughal courts, 16th century"
  story: string[];       // 2–3 paragraphs, each <= 70 words
  ingredients: string[]; // 5–8 items
  sources: { claim: string; url: string }[];
};
export const masalas: Masala[];
```

## Wave 1 — four parallel agents

### Task 1: Awwwards research
**Files:** Create `docs/research/awwwards-3d.md`
- [ ] Survey 6–10 Awwwards Site-of-the-Day / 3D-category sites (product or food/drink storytelling preferred).
- [ ] For each: URL, what the 3D does on scroll, typography treatment, transitions, preloader, what makes it feel premium.
- [ ] End with 10 concrete techniques ranked by impact for a four-jar spice story, each implementable in r3f + GSAP.
**Done when:** file exists, every site has a working URL, techniques are specific (not "use good lighting").

### Task 2: Jar, labels, gift box (Blender)
**Files:** Create `blender/jar.py`, `blender/box.py`, `blender/labels/*.svg`, `blender/build_labels.mjs`, `blender/render_stills.py`; output `public/models/jar.glb`, `public/models/box.glb`, `public/textures/label-<id>.png`, `public/textures/label-<id>-foil.png`, `public/textures/spice-albedo.png`, `public/textures/spice-normal.png`, `public/renders/{hero,garam,biryani,elite,pili,box}.webp`
**Produces:**
- `jar.glb`: objects `Glass` (real wall thickness, heavy base, neck thread), `Lid` (knurled, origin at lid base centre so it can lift along +Y), `Label` (cylinder band, UV 0–1 mapped to a 2:1 image, seam at the back), `Spice` (fill volume, uneven granular top). Jar origin at base centre; total height ≈ 1.25 units, diameter ≈ 0.62. ≤ 1.5 MB.
- `box.glb`: `BoxBase` (origin base centre; inner cavity fits four jars lying side by side as in the reference photo), `BoxLid` (origin on the rear hinge edge), `Crinkle` paper fill. ≤ 2 MB.
- Labels 2048×1024: `label-<id>.png` full colour (chapter colour paper, gold wordmark with leaf-in-O, "PREMIUM SPICES", rule, product name, "100% NATURAL", line illustration: garam = star anise + cinnamon + cardamom, biryani = rice bowl + herb sprig, elite = garlic + tomato + parsley, pili = two chillies). `label-<id>-foil.png` white where gold foil is, black elsewhere. Text must be converted to paths (bundle an OFL serif, e.g. Cormorant Garamond) so rasterising does not depend on system fonts.
- `spice-albedo.png` / `spice-normal.png`: tileable 1024², neutral mid-tone granular powder (tinted at runtime).
- Cycles stills 1920×1280 webp matching the reference photos' mood (dark studio, warm key, soft reflection).
**Done when:** each GLB is re-imported in Blender by a check script that asserts the object names and sizes above; stills are viewed by the agent and judged against the reference description; report lists file sizes.

### Task 3: Whole spices (Blender)
**Files:** Create `blender/spices.py`, `blender/render_spices.py`; output `public/models/spices.glb`, `public/renders/spices.webp`
**Produces:** objects `StarAnise` (8 boat-shaped carpels with seeds), `Cinnamon` (rolled quill), `Cardamom` (ridged green pod), `Peppercorn` (wrinkled sphere), `BayLeaf` (veined, slightly curled), `Chilli` (dried, wrinkled, with stem), `Garlic` (bulb with papery clove ridges). Each centred on its own origin, longest dimension ≈ 0.4 units (peppercorn 0.06), baked 1024² base-colour + normal textures embedded, total ≤ 3 MB.
**Done when:** check script asserts the seven names; a Cycles contact-sheet render is viewed by the agent and each spice is recognisable; report lists sizes.

### Task 4: Heritage content
**Files:** Modify `content/masalas.ts` (replace stub data, keep the type and export names exactly)
- [ ] Research each blend's real history with web sources (garam masala and North Indian/Mughal cookery; biryani's Persian–Mughal lineage and regional schools; the all-purpose kitchen-king style blend; yellow chilli "pili mirch" and chilli's 16th-century arrival via Portuguese trade).
- [ ] Write per the `Masala` type limits. Voice: warm, exact, unhurried; no superlatives about Ozavia.
- [ ] Every dated or named claim has an entry in `sources`. Where history is disputed, say so.
**Done when:** `npx tsc --noEmit` passes; no claim about Ozavia as a company.

## Wave 1b — orchestrator, while agents run

### Task 5: App shell
**Files:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `components/{Preloader,Hero,Chapter,Craft,Finale,EnquiryForm,Footer,SmoothScroll,Wordmark}.tsx`, `lib/scroll-store.ts`, `lib/enquiry.ts`, `lib/enquiry.test.ts`, `app/api/enquiry/route.ts`
- [ ] `lib/enquiry.ts`: `validateEnquiry(input: unknown): { ok: true; value: Enquiry } | { ok: false; errors: Record<string,string> }` — name 2–80 chars, email matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` and ≤ 200, message 10–2000, honeypot `company` must be empty.
- [ ] `lib/enquiry.test.ts` with `node:test`: accepts a valid body; rejects short name, bad email, short message, filled honeypot, non-object. Run `node --test --experimental-strip-types lib/enquiry.test.ts`.
- [ ] Route appends `{...value, at}` as a JSON line to `data/enquiries.jsonl`; `data/` git-ignored.
- [ ] `lib/scroll-store.ts`: plain mutable object `{ progress: number; chapter: number; chapterProgress: number }` written by ScrollTrigger, read in `useFrame` (no React re-renders).
- [ ] DOM sections with real copy, fonts via `next/font`, colour shift via a CSS variable.

## Wave 2 — orchestrator

### Task 6: Scene and choreography
**Files:** `components/scene/{Experience,Jar,Jars,SpiceBurst,Spices,GiftBox,Lights}.tsx`, `components/StaticFallback.tsx`
- [ ] Load GLBs (Draco), runtime label/spice-colour swap, glass via transmission material, studio environment.
- [ ] Hero line-up → per-chapter focus, turn, lid lift, particle burst → craft drift → box finale, all driven by `scroll-store`.
- [ ] Apply the top techniques from `docs/research/awwwards-3d.md`.
- [ ] Fallback to `public/renders/*` for reduced motion / no WebGL / small low-power screens.

## Wave 3 — orchestrator

### Task 7: Verify
- [ ] `npm run build`, `npm run lint`, enquiry test.
- [ ] Browser pass at 1440 and 390 widths: each section, scroll run-through, form success and rejection, console clean.
- [ ] Fix, then commit.
