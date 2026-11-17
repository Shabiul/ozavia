# Awwwards 3D research for Ozavia Premium Spices

Research date: 2026-11-17. Scope: awwwards.com Sites of the Day / Month and 3D collections, favouring food, drink and luxury product storytelling, plus case studies of the same sites.

## How to read this

- Sources were read as text (awwwards site pages, awwwards case studies, studio blogs). The live WebGL sites were **not** rendered or watched, so nothing here is a first-hand visual observation. Where a source did not document something (very often: fonts, preloader, cursor) the entry says "not documented" instead of guessing.
- Every URL below was either opened or appeared in search results during this session.
- Could not be opened (HTTP 403): the Codrops articles on INK Games (`https://tympanus.net/codrops/?p=104466`, an r3f + drei + GSAP + Lenis single-canvas build) and on Bonhomme's luxury work (`https://tympanus.net/codrops/?p=118060`). They are not used as evidence.
- Lusion's Oryzo making-of parts 4 to 7 (the WebGL tricks) were not found in search, so Oryzo's shader details are unverified.

## Sites surveyed

### 1. La Revoltosa (Spanish soda brand) - closest match to Ozavia

- Awwwards: https://www.awwwards.com/sites/la-revoltosa - Site of the Day, 21 May 2026 (7.45), by Waka (Madrid).
- Case study: https://www.awwwards.com/la-revoltosa-rebooting-a-70-year-old-spanish-soda-brand-for-the-scroll-generation.html
- Live: https://larevoltosa.es/
- Stack: Three.js, GSAP, Lenis, custom WordPress theme.
- 3D on scroll: a glass bottle in the hero, built as two parts with different materials, both using IOR refraction and reflections. On the products page the 3D model, a 2D illustration and the background colour all change together from one scroll progress value. Awwwards highlights "3D scrolling animation", "Product scrolling animation" and "3D product interaction" (mouse).
- Typography: fonts not documented. The hero headline is rendered **inside the Three.js scene**, not as HTML, so it distorts through the bottle's refraction; each letter is separate geometry, animated in on entry.
- Section transitions: scrollytelling "chapters"; a brand SVG scales until it covers the screen; a view-mode switch (scroll story vs grid) with an animated transition; menu transition.
- Preloader: not documented.
- Cursor/hover: product card hover and mouse-driven 3D product interaction are listed; details not documented.
- Why it feels premium: the product is real glass that bends the type behind it; one scroll value drives model, illustration and background, so nothing drifts out of sync.
- Performance notes from the team: aggressive polygon reduction, one shared base geometry with only labels/colours swapped, only the active bottle kept in memory. They state that 60fps on every mid-range phone was not achievable with refraction.

### 2. Oryzo AI (Lusion's satirical cork-coaster product launch)

- Awwwards: https://www.awwwards.com/sites/oryzo-ai - Site of the Day, 13 Apr 2026 (7.86; Animations 8.60). Lusion's awwwards profile (https://www.awwwards.com/lusion/) is reported in search results as also listing Site of the Month, April 2026.
- Making-of: https://blog.lusion.co/oryzo-bts-part-1-7-concept-and-creative-direction , https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics , https://blog.lusion.co/oryzo-bts-part-3-7-website-ux-ui-and-illustrations
- Live: https://oryzo.ai
- Stack: Three.js, WebGL, GSAP. Assets from Houdini + Redshift.
- 3D on scroll: a linear scroll story about one object. The camera follows a spline. A macro cork section scrolls horizontally and loops seamlessly (periodic noise so positions and normals tile). Third-party write-ups describe the product moving with inertia and weight, and scaling/repositioning to become part of a flat UI layout.
- Typography: about 99 percent of the type is one family (name not documented). Four colours only: cream, near-black, muted olive, orange.
- Section transitions: awwwards lists "3D -> 2D -> 3D Transition", "Reveal Transition", "Gallery Transition", "Intro Transition". "Seamless transitions" is one of the four stated design principles. Mechanics not documented.
- Preloader: an "Intro Interaction" and "Intro Transition" are listed; details not documented.
- Cursor/hover: a draggable microscope view box (shake it for an easter egg); interactive particles in the footer.
- Why it feels premium: restraint (one typeface, four colours, UI that stays out of the render's way), a believable environment instead of a floating product, scanned real materials, texture detail concentrated where the camera actually looks.

### 3. Cartier Watches & Wonders 2025 (Immersive Garden)

- Awwwards: https://www.awwwards.com/sites/cartier-watches-wonders-2025 - Site of the Day, 18 Aug 2025 (7.64; Animations/Transitions 9.00).
- Case study: https://www.awwwards.com/watches-wonders-immersive-experience-for-cartier.html
- Live (as listed by awwwards, a staging host): https://cartier-waw-0225.dev.60fps.fr/ . The 2026 edition is listed elsewhere at cartier.com/en-fr/watchesandwonders (seen in a roundup, not opened).
- Stack: Three.js, Blender, GSAP, Lenis, Sass, Web Audio API.
- 3D on scroll: six 3D "alcoves", one per watch, scrolled through in sequence. How scroll maps to camera is not documented.
- Typography, preloader: not documented.
- Section transitions: alcove to alcove; mechanics not documented.
- Cursor/hover: "hidden gestures that reward curiosity"; "Products Interaction" listed.
- Why it feels premium: one self-contained room per product (the same shape as Ozavia's one chapter per masala), slow evolving compositions, a composed soundscape treated as narrative, not background.

### 4. Varani Gin

- Awwwards: https://www.awwwards.com/sites/varani-gin - Nominee, 3 Sep 2025. Designer Matteo De Filippis.
- Element page: https://www.awwwards.com/inspiration/the-gin-view-as-you-scroll-the-3d-bottle-pours-into-a-3d-glass-botanicals-and-molecules-including-the-hormone-of-happiness-emerge-with-the-flow-evoking-flavors-and-emotions-to-immerse-users-and-drive-conversion-varani-gin
- Live: https://www.varanigin.com/ (gin view: https://www.varanigin.com/ilgin)
- Stack: Three.js, Vue, Node, SVG.
- 3D on scroll: a 3D bottle pours into a 3D glass as you scroll, and botanicals and molecules emerge with the flow. This is the nearest reference to "lid lifts, spice bursts out". Also a rotating bottle element.
- Typography: Art Nouveau / 1920s styling; fonts not documented.
- Transitions, preloader, cursor: not documented.
- Why it feels premium: the ingredients come out of the product itself, so the 3D tells you what is in the bottle instead of decorating the page.

### 5. Dialed Coffee Company

- Awwwards: https://www.awwwards.com/sites/dialed-coffee-company - Nominee, 15 Nov 2026 (voting open on research date). By OFF+BRAND.
- Live: https://www.dialedcoffee.com/
- Stack: Webflow, Three.js, WebGL.
- 3D: highlighted elements are a WebGL product slider, product transitions, a pouring water effect and a discount easter egg. Scroll behaviour, type, preloader and cursor are not documented.
- Use for Ozavia: reference for moving between sibling products (four jars) inside one WebGL scene.

### 6. Duyu Care (supplement jars)

- Awwwards: https://www.awwwards.com/sites/duyu-care - Honorable Mention, 9 May 2026. By Dops Agency.
- Element page: https://www.awwwards.com/inspiration/product-duyu-care (tags: product, jar, scroll)
- Live: https://duyucare.dops.agency/
- Stack: Next.js, React, GSAP (same base as Ozavia).
- 3D: "realistic 3D product graphics with sophisticated photo shoots"; highlighted elements include Product Details (jar, scroll), Pills Rotation, Appearance of Elements, Website Preloader, a 404 game. Whether the jar is real-time 3D or pre-rendered is not documented.
- Why it feels premium: dark single-colour palette (#2F3834, close to Ozavia's olive) with product renders and photography mixed, so the 3D is not carrying the whole page.

### 7. More Nutrition - Iced Matcha Latte (concept site)

- Awwwards: https://www.awwwards.com/sites/more-nutrition - Site of the Day, 3 Nov 2025 (7.39). By FUTURE THREE with Somefolk.
- Case study: https://www.awwwards.com/more-nutrition-you-deserve-more.html
- Live: https://more-nutrition.webflow.io/
- Stack: Webflow, GSAP, Canvas API, Lenis, Swiper. **No real-time 3D.**
- 3D on scroll: pre-rendered frames tied to scroll with GSAP. Swapping `img` sources lagged on fast scroll, so they draw frames to a 2D canvas instead.
- Preloader and hover effects exist; details not documented. Fonts not documented.
- Use for Ozavia: this is the fallback pattern for low-end phones (see Avoid list), and proof that an SOTD jury does not require real-time WebGL.

### 8. Savor (Resn)

- Awwwards: https://www.awwwards.com/sites/savor - Site of the Day, 10 Sep 2025 (7.56).
- Case study: https://www.awwwards.com/savor-reimagining-the-future-of-fat.html
- Live: https://savor.it/
- Stack: GSAP, Lenis, Rive, WebGL via TWGL.js.
- On scroll: scroll-controlled Rive diagrams; no 3D scene.
- Section transitions: the "Bubble Transition", two Bezier curves forming an organic wipe between sections, drawn in one shared WebGL context. The logo is a signed distance field morphed in a fragment shader (CSS filters were dropped for poor performance).
- Typography is one of the awwwards-highlighted elements; fonts not documented.
- Use for Ozavia: the organic wipe between chapters, and the rule of one shared WebGL context.

### 9. SPYLT (Tubik) - secondary source only

- Case study: https://tubikstudio.com/blog/spylt-case-study/ (states it won awwwards Site of the Day and E-Commerce Honors; the awwwards page itself was not opened, and no live URL was given).
- Stack: Webflow, GSAP, transparent video (WebM for Chrome, HEVC for Safari), Lottie.
- On scroll: one continuous "pour"; headlines scale; the background changes to each flavour's colour as that flavour's section arrives; a circular video reveal is a scale animation over a radial mask.
- Hover: a chocolate drip Lottie on the main button.
- Use for Ozavia: background colour per flavour maps directly to red / olive / navy / orange chapters.

### Patterns that repeat across the winners

1. GSAP + Lenis is the default scroll layer in nearly every entry.
2. One product, one scroll progress value, everything else derived from it.
3. Very limited palette and one type family; the product provides the colour.
4. Transitions are what juries score: Cartier's highest dev score is Animations/Transitions (9.00), Oryzo's is Animations (8.60).
5. Teams with glass admit it is expensive and budget for it (shared geometry, one active model).

## Ten techniques for Ozavia

Ranked by visual impact. All assume one fixed full-viewport `<Canvas>` behind the DOM, Lenis driving `ScrollTrigger.update`, and GSAP timelines writing to refs or a plain mutable object that `useFrame` reads (never React state per frame).

### 1. Headline refracted through the glass jars

- What: the hero wordmark sits in the 3D scene behind the jars, so the glass bends and tints the letters as the jars move. (La Revoltosa.)
- Where: hero line-up; reuse for each chapter's masala name.
- How: drei `<Text>` (one per letter, or use `Text3D`) placed behind the jars; jar bodies use drei `<MeshTransmissionMaterial>` with `ior` about 1.5, `thickness`, low `chromaticAberration`, and a tinted `attenuationColor` per masala. Render the transmission buffer once with `useFBO` and pass it as `buffer` to all four jars, with `samples` 4 to 6 and `resolution` 512, so four jars cost one extra pass. Animate letters in with a GSAP stagger on `position.y` and `fillOpacity`. Keep an HTML `<h1>` for accessibility and SEO, visually hidden.

### 2. One persistent jar per chapter, driven by a single scrubbed master timeline

- What: the jar never cuts. It leaves the line-up, comes forward, turns, opens, then returns, all on one timeline, so chapter boundaries read as continuous motion. (Oryzo's "seamless transitions"; La Revoltosa's single progress value.)
- Where: the whole page, hero to finale.
- How: one `gsap.timeline({ scrollTrigger: { trigger: main, start: 'top top', end: 'bottom bottom', scrub: 1 } })` with a label per chapter (`addLabel('garam')` ...). Each chapter is a nested timeline added at its label. Pin nothing in the DOM; the canvas is `position: fixed`. Tween jar group `position`, `rotation.y` (a full `Math.PI * 2` turn with `power2.inOut`) and a `lidLift` value. Use `scrub: 1` (not `true`) so there is a second of catch-up that reads as weight.

### 3. Lid lift and scroll-scrubbed spice burst

- What: the gold lid rises and tilts, then a plume of that masala's powder and whole spices erupts and hangs in the air. Because it is scrubbed, scrolling back sucks it into the jar. (Varani Gin's pour with botanicals emerging.)
- Where: the peak of each masala chapter.
- How: lid is its own mesh; tween `position.y` and `rotation.z` with `back.out(1.6)`. Powder: one `THREE.Points` with a small custom `shaderMaterial` taking `uProgress`; each particle has a random direction, speed and curl seed in attributes, and the vertex shader computes `position = origin + dir * speed * easeOut(uProgress) + gravity * uProgress^2`, with size and alpha fading at the end. Whole spices (chilli, cardamom, star anise): drei `<Instances>` with 30 to 60 instances following the same formula on the CPU. GSAP tweens only `uProgress` from 0 to 1. Colour comes from the chapter (red, olive, navy accents, orange).

### 4. Gold that catches moving light

- What: highlights sweep across the lid and the foil label as the jar turns, the way foil behaves in a hand.
- Where: every jar shot; most visible in the turn of technique 2 and in the hero.
- How: drei `<Environment resolution={256}>` containing three or four `<Lightformer>` strips (no HDRI download). Put the Lightformers in a group and rotate that group from the scroll timeline, opposite to the jar's turn. Lid: `MeshPhysicalMaterial` `metalness={1}` `roughness={0.25}` with `anisotropy` about 0.6 for a brushed look. Label: a `metalnessMap` that is white only on the foil lettering, so only the gold type flashes. Add `<Bloom mipmapBlur luminanceThreshold={0.9} intensity={0.4}>` from `@react-three/postprocessing` so only those peaks glow.

### 5. Chapter colour takeover with an organic wipe

- What: each masala floods the page in its own colour, arriving as a soft-edged wipe instead of a cut. (SPYLT's flavour backgrounds; Savor's Bezier bubble wipe.)
- Where: the four boundaries between hero and chapters, and chapter to chapter.
- How: a full-screen quad at the back of the scene (drei `<ScreenQuad>`) with a fragment shader mixing `uColorA` and `uColorB` across a threshold `uProgress` offset by low-frequency noise, so the edge is wavy. GSAP sets the two colours at each label and scrubs `uProgress`. Drive a CSS custom property from the same tween so DOM text colour flips with it. Colours: deep versions of the jar colours, not full saturation.

### 6. Finale: jars settle into the gift box, then the box becomes the form's companion

- What: the four jars fly back into formation, drop into the olive box with a small settle, the lid closes, and the closed box moves to sit beside the enquiry form as a flat-layout element. (Oryzo's "3D -> 2D -> 3D" transition, where the model becomes part of the UI.)
- Where: finale into the enquiry section.
- How: staggered timeline, each jar `power3.inOut` to a point above its slot, then a short drop with `bounce.out` damped to one bounce (or `back.out(2)`), 0.08 s stagger. Box lid closes with `power2.in` and a 2 degree overshoot. For the hand-off, read the target DOM element's `getBoundingClientRect()`, unproject its centre to world space at the box's depth, and tween the box there; recompute on resize via `ScrollTrigger.addEventListener('refresh', ...)`. Ground the box with drei `<ContactShadows frames={1}>` re-rendered only when jars move.

### 7. Camera on a rail with damping

- What: the camera glides along a spline through the story, pushing in for the lid lift and pulling back for the box, with slight lag. (Oryzo's spline camera; Cartier's alcove journey.)
- Where: whole page; strongest in the move from the line-up into the first chapter and from the last chapter out to the box.
- How: a `THREE.CatmullRomCurve3` through 8 to 10 hand-placed points and a second curve for the look-at target. The master timeline tweens a single `camT` from 0 to 1 with `ease: 'none'`. In `useFrame`, `curve.getPointAt(camT)` and damp toward it with `easing.damp3(camera.position, target, 0.25, delta)` from `maath`, then `camera.lookAt` the damped target. Add a few degrees of pointer parallax on top.

### 8. Drifting whole-spice strip with depth of field

- What: cinnamon, cloves, cardamom and chillies float past in three depth layers, the near ones soft and large, the far ones small, looping endlessly and reacting to scroll speed. (Oryzo's seamless horizontal loop.)
- Where: the strip between the last chapter and the finale.
- How: drei `<Instances>` per spice type (four or five low-poly models, about 80 instances total). Each instance has a lane, depth and phase; x position is `((phase + time * speed + scroll * k) % width) - width / 2` so it wraps without a seam. Take `lenis.velocity` and add it to spin and drift, clamped. Add `<DepthOfField focusDistance={...} focalLength={0.02} bokehScale={3}>` only while this section is on screen (toggle with a ScrollTrigger `onToggle`), since it is the most expensive pass.

### 9. Preloader that hands off into the hero

- What: a quiet loader showing real progress, which ends by revealing the scene and raising the jars one by one, so loading and the first animation are one gesture. (Duyu Care's listed preloader element; Oryzo's intro transition.)
- Where: first paint.
- How: drei `useProgress` for the real number; render it as a large serif numeral plus a thin gold rule whose `scaleX` is the progress. Hold the canvas at `frameloop="demand"` until loaded. On complete, play one non-scrubbed GSAP timeline: loader panel `clipPath` from `inset(0)` to `inset(0 0 100% 0)`, jars rise from `y: -1.5` with `power4.out` and 0.12 s stagger, the Lightformer group sweeps once (technique 4), then unlock Lenis with `lenis.start()`. Preload with `useGLTF.preload` and KTX2 textures so the number is honest and short.

### 10. Jars that answer the pointer

- What: jars lean a few degrees toward the cursor with inertia, and the cursor becomes a small gold ring that grows and shows the masala name over a jar; clicking a jar in the hero scrolls to its chapter. (La Revoltosa's "3D product interaction"; Oryzo's inertia.)
- Where: hero line-up, and the forward jar in each chapter. Disabled on touch.
- How: in `useFrame`, `easing.dampE(group.rotation, [pointer.y * 0.15, baseY + pointer.x * 0.3, 0], 0.3, delta)`, added on top of the scroll-driven rotation by using a child group. `onPointerOver` / `onPointerOut` on each jar set a hovered id; the DOM cursor is one fixed `div` moved with `gsap.quickTo(el, 'x')` / `quickTo(el, 'y')`. Click calls `lenis.scrollTo(labelPosition)` using `tl.scrollTrigger.labelToScroll('garam')`.

## Avoid

- Unbounded device pixel ratio. Cap with `dpr={[1, 1.75]}` and use drei `<PerformanceMonitor>` to step down; glass plus bloom at DPR 3 is what makes phones stutter.
- One transmission pass per jar. Four jars each doing their own refraction render is four extra scene renders per frame; share one buffer (technique 1) and switch off-screen jars to a cheap `MeshPhysicalMaterial`.
- More than one WebGL context or canvas. Savor's team built a layer system specifically to avoid this.
- A multi-megabyte HDRI and uncompressed PNG labels. Use Lightformers, Draco or Meshopt geometry, KTX2 textures. La Revoltosa shared one geometry across bottles and swapped only labels; the four Ozavia jars should be one mesh with four label textures.
- Scroll-jacking: snapping, forced section jumps, or long pins that make the scrollbar lie. Lenis smoothing plus scrubbed timelines is enough.
- Unscrubbed, time-based animation in the story sections. If the burst plays on its own clock, fast scrollers miss it and scrolling back looks broken.
- A fake preloader (a timer, or one that sits at 100 percent). Tie it to `useProgress` or leave it out.
- Stacking post effects: bloom, depth of field, chromatic aberration, noise, vignette and god rays together read as a template. Pick bloom on gold peaks and depth of field in one section.
- Plastic-looking materials: default `MeshStandardMaterial`, no environment, flat ambient light, perfectly sharp edges with no bevel. Gold with nothing to reflect looks like yellow plastic.
- Jars floating with no contact shadow or ground cue.
- Many typefaces and colours. Oryzo used one family and four colours; let the four jar colours do the work.
- Setting React state from scroll or pointer every frame. Mutate refs.
- Shipping the full scene to low-end phones. Follow More Nutrition: detect weak devices and serve a pre-rendered frame sequence drawn to a 2D canvas, or a static render, instead.
- Autoplaying sound, and ignoring `prefers-reduced-motion`. Under reduced motion show the settled poses and plain fades.
- Hiding the content in the canvas. Keep real headings, copy and the enquiry form in the DOM so the page is readable, indexable and usable if WebGL fails.
