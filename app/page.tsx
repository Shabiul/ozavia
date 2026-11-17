import { masalas } from "@/content/masalas";
import { EnquiryForm } from "@/components/EnquiryForm";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Stage } from "@/components/Stage";
import { Wordmark } from "@/components/Wordmark";

const whole = [
  { name: "Star anise", latin: "Illicium verum", origin: "Southern China and Vietnam" },
  { name: "Cinnamon", latin: "Cinnamomum verum", origin: "Sri Lanka" },
  { name: "Green cardamom", latin: "Elettaria cardamomum", origin: "Western Ghats, India" },
  { name: "Black pepper", latin: "Piper nigrum", origin: "Malabar Coast, India" },
  { name: "Indian bay leaf", latin: "Cinnamomum tamala", origin: "Himalayan foothills" },
  { name: "Chilli", latin: "Capsicum annuum", origin: "Mesoamerica" },
  { name: "Garlic", latin: "Allium sativum", origin: "Central Asia" },
];

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <Stage />

      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-[#0c0d09]/85 to-transparent px-6 pt-5 pb-10 md:px-10">
        <a href="#top" className="text-xl text-cream"><Wordmark /></a>
        <nav className="flex gap-6 text-[0.68rem] uppercase tracking-[0.32em] text-cream md:gap-10">
          <a href="#masalas" className="hover:text-gold">Masalas</a>
          <a href="#craft" className="hidden hover:text-gold sm:block">Whole spices</a>
          <a href="#enquire" className="hover:text-gold">Enquire</a>
        </nav>
      </header>

      <main id="top" className="relative z-10">
        {/* HERO: the wordmark sits behind the 3D jars */}
        <section data-track="hero" data-tint="#14160f" className="relative flex h-[100svh] flex-col items-center overflow-hidden">
          <h1 className="three-hide gold-text pointer-events-none mt-[13vh] select-none text-[22vw] leading-none md:text-[19vw]">
            <Wordmark />
          </h1>
          <img src="/renders/hero.webp" alt="Four Ozavia spice jars: Garam Masala, Biryani Masala, Elite All Purpose Masala and Pili Mirch" className="static-only absolute inset-x-0 bottom-0 mx-auto h-[62%] w-full object-cover object-center [mask-image:linear-gradient(to_bottom,transparent,black_18%)]" />
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-6 pb-8 md:px-10">
            <p data-reveal className="font-display max-w-[14ch] text-3xl leading-tight text-cream md:text-5xl">
              Pure Taste. <em className="text-gold-light">Naturally Yours.</em>
            </p>
            <p className="eyebrow hidden md:block">Scroll · four masalas, four histories</p>
          </div>
        </section>

        {/* CHAPTERS */}
        <div id="masalas">
          {masalas.map((m, i) => (
            <section
              key={m.id}
              data-track={`ch${i}`}
              data-tint={m.color}
              aria-labelledby={`${m.id}-title`}
              className={`relative z-20 grid px-6 md:grid-cols-2 md:px-10`}
            >
              <div className={`flex flex-col ${i % 2 ? "md:col-start-2" : ""}`}>
                <div className="flex min-h-[100svh] flex-col justify-center py-24">
                  <p className="eyebrow">
                    {String(i + 1).padStart(2, "0")} / 04 <span className="mx-3 text-cream/30">—</span> {m.era}
                  </p>
                  <h2 id={`${m.id}-title`} data-reveal className="font-display mt-6 text-[15vw] font-light leading-[0.92] text-cream md:text-[7.2vw]">
                    {m.name}
                  </h2>
                  <p data-reveal className="font-display mt-8 max-w-[24ch] text-2xl italic text-gold-light md:text-3xl">
                    {m.hook}
                  </p>
                  <img src={`/renders/${m.id}.webp`} alt={`Ozavia ${m.name} jar`} loading="lazy" className="static-only mt-10 aspect-[3/2] w-full rounded-sm object-cover" />
                </div>
                {m.story.map((p, j) => (
                  <div key={j} className="flex min-h-[70svh] items-center">
                    <p data-reveal className="max-w-[34ch] rounded-sm text-xl font-light leading-relaxed text-cream/90 max-md:bg-[#0c0d09]/55 max-md:p-4 max-md:backdrop-blur-sm md:text-2xl">
                      {p}
                    </p>
                  </div>
                ))}
                <div className="flex min-h-[70svh] flex-col justify-center pb-24">
                  <p className="eyebrow">In the blend</p>
                  <ul className="font-display mt-6 max-w-md text-3xl leading-snug text-cream md:text-4xl">
                    {m.ingredients.map((s) => (
                      <li key={s} className="border-b border-cream/15 py-2">{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* CRAFT: whole spices drift through the canvas */}
        <section id="craft" data-track="craft" data-tint="#2b2a17" className="relative z-20 px-6 py-[30vh] md:px-10">
          <p className="eyebrow">Whole before ground</p>
          <h2 data-reveal className="font-display mt-6 max-w-[16ch] text-6xl font-light leading-none text-cream md:text-[7vw]">
            Every blend begins as something you could hold.
          </h2>
          <img src="/renders/spices.webp" alt="Whole spices: star anise, cinnamon, cardamom, peppercorns, bay leaf, chilli and garlic" loading="lazy" className="static-only mt-12 w-full rounded-sm" />
          <ul className="mt-[30vh] grid gap-x-10 gap-y-[22vh] md:grid-cols-2">
            {whole.map((w, i) => (
              <li key={w.name} className={i % 2 ? "md:mt-[22vh] md:text-right" : ""}>
                <p className="eyebrow">{w.origin}</p>
                <p data-reveal className="font-display mt-3 text-5xl text-cream md:text-6xl">{w.name}</p>
                <p className="font-display mt-1 text-xl italic text-gold-light/80">{w.latin}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* FINALE: jars settle into the gift box */}
        <section data-track="finale" data-tint="#3a3f2a" className="relative h-[320svh]">
          <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-between overflow-hidden py-[12vh] text-center">
            <h2 data-reveal className="font-display text-6xl font-light leading-none text-cream md:text-[8vw]">
              Four jars. <em className="gold-text">One box.</em>
            </h2>
            <img src="/renders/box.webp" alt="The Ozavia gift box holding all four jars" loading="lazy" className="static-only w-full max-w-4xl object-contain" />
            <p className="eyebrow">The Ozavia gift collection</p>
          </div>
        </section>

        {/* ENQUIRY */}
        <section id="enquire" className="relative z-30 bg-[#0c0d09] px-6 py-32 md:px-10">
          <div className="rule mb-24" />
          <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2">
            <div>
              <p className="eyebrow">Enquiries</p>
              <h2 data-reveal className="font-display mt-6 text-6xl font-light leading-none text-cream md:text-7xl">
                Write to us.
              </h2>
              <p className="mt-8 max-w-sm text-lg font-light leading-relaxed text-cream/70">
                For gifting, trade and stockist enquiries, leave a note and we will reply by email.
              </p>
            </div>
            <EnquiryForm />
          </div>
        </section>
      </main>

      <footer className="relative z-30 bg-[#0c0d09] px-6 pb-10 md:px-10">
        <details className="mx-auto max-w-6xl border-t border-cream/15 py-6 text-sm text-cream/60">
          <summary className="eyebrow cursor-pointer">Sources for the histories</summary>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            {masalas.map((m) => (
              <div key={m.id}>
                <p className="font-display text-xl text-cream">{m.name}</p>
                <ul className="mt-2 space-y-1">
                  {m.sources.map((s) => (
                    <li key={s.url + s.claim}>
                      <a href={s.url} target="_blank" rel="noreferrer" className="underline decoration-cream/30 underline-offset-4 hover:text-gold">
                        {s.claim}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
        <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-cream/15 pt-6 text-xs uppercase tracking-[0.3em] text-cream/50">
          <Wordmark className="text-lg normal-case tracking-normal text-gold" />
          <span>Pure Taste. Naturally Yours.</span>
        </div>
      </footer>
    </>
  );
}
