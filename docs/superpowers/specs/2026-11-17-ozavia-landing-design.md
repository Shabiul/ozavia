# Ozavia Premium Spices — 3D landing site (design)

Approved by the user on 2026-11-17.

## Goal
A single-page, Awwwards-grade 3D landing site for Ozavia Premium Spices. It presents four masalas
(Garam Masala, Biryani Masala, Elite All Purpose Masala, Pili Mirch) and tells the real cultural
origin of each. No e-commerce: no cart, prices or checkout. The page ends in an enquiry form.

## Constraints
- Project root: `D:\NIITMTS-main\ozavia` (own git repo). Nothing outside it is touched.
- Heritage copy is real spice history only. No invented claims about Ozavia's founders, farms,
  age or awards.
- Blender: `E:\NoHesiInstaller\java\blender-5.4.0-alpha+main.6f4fc760c138-windows.amd64-release\blender-5.4.0-alpha+main.6f4fc760c138-windows.amd64-release\blender.exe`
  (5.4 alpha, headless, OptiX on RTX 4060). All models are made by Python scripts kept in `blender/`.

## Brand
- Wordmark: OZAVIA in a high-contrast serif, leaf inside the O, "PREMIUM SPICES" letterspaced sans.
- Tagline: "Pure Taste. Naturally Yours."
- Palette: olive black `#14160f`, box olive `#3a3f2a`, foil gold `#c9a45c`, cream `#efe6d2`;
  chapter colours Garam `#8e2a22`, Biryani `#4d5a2c`, Elite `#1f3358`, Pili Mirch `#c8601c`.

## Stack
Next.js App Router (TypeScript), Tailwind, three + @react-three/fiber + drei + postprocessing,
GSAP ScrollTrigger, Lenis.

## 3D assets (Blender → Draco GLB in `public/models/`)
- `jar.glb`: one jar, separate named meshes `Glass`, `Lid`, `Label`, `Spice`. Thick glass, knurled
  gold lid with thread, label UV-mapped to a 2:1 rectangle so the site swaps the four label
  textures and spice colours at runtime.
- `box.glb`: olive gift box, separate `BoxBase`, `BoxLid` (pivot at the hinge edge), crinkle-paper
  fill, gold logo on lid interior.
- `spices.glb`: `StarAnise`, `Cinnamon`, `Cardamom`, `Peppercorn`, `BayLeaf`, `Chilli`, `Garlic`.
- Label textures: four 2048×1024 PNGs (colour, plus one shared gold-foil mask per label) in
  `public/textures/`, drawn from SVG line art.
- Cycles stills in `public/renders/`: hero line-up, one per jar, gift box. Used as the
  mobile / reduced-motion / no-WebGL fallback and as social image.

## Page structure (one persistent fixed canvas behind DOM sections)
1. Preloader — gold wordmark draws in while assets load.
2. Hero — four jars in a dark studio; tagline.
3. Four chapters — the jar comes forward and turns, the lid lifts, spice particles burst, page
   colour shifts to the chapter colour; origin story sits beside it.
4. Craft strip — whole spices drift past with ingredient notes.
5. Finale — jars settle into the gift box.
6. Enquiry form and footer.

## Content
`content/masalas.ts` exports the four chapters: name, colour, one-line hook, 2–3 short paragraphs
of history, ingredient list, and source URLs for each historical claim.

## Backend
`POST /api/enquiry` — validates name, email, message (lengths, email shape), honeypot field,
appends a JSON line to `data/enquiries.jsonl` (git-ignored). Returns 200 / 400.
<!-- ponytail: file storage, single instance only; swap for a DB or email service when hosted serverless -->

## Fallbacks and quality
- `prefers-reduced-motion`, no WebGL, or narrow low-power devices: static Cycles renders with the
  same copy; no smooth-scroll hijack.
- Semantic headings, keyboard-reachable form with labels and error text, sufficient contrast.
- Metadata and Open Graph image.

## Verification
- `npm run build` passes; one test file for the enquiry validator.
- Manual browser pass at desktop and phone widths: every section renders, scroll choreography
  runs, form submits and rejects bad input, console is clean.
