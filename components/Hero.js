"use client";

import Image from "next/image";

const ArrowUpRight = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const principles = [
  { number: "01", title: "Consent that continues", tone: "bg-[#f5a278]" },
  { number: "02", title: "Privacy by community design", tone: "bg-[#f4d56f]" },
  { number: "03", title: "Benefits shared, not extracted", tone: "bg-[#97c9aa]" },
];

export default function Hero({ onExploreClick }) {
  const handleCtaClick = (e) => {
    if (onExploreClick) {
      e.preventDefault();
      onExploreClick();
    }
  };

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section
        id="top"
        className="relative mx-auto grid max-w-[1440px] gap-12 px-5 pb-14 pt-9 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:px-14 lg:pb-20 lg:pt-14"
      >
        <div className="relative z-10">
          <div className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.19em] text-[#315b4e]">
            <span className="h-px w-9 bg-[#e3613f]" />A mental health data
            commons proof of concept
          </div>

          <h1 className="max-w-[760px] text-[clamp(3.8rem,8vw,7.7rem)] leading-[0.84] tracking-[-0.055em] [font-family:var(--font-dm-serif-display),serif] text-[#172c26]">
            Our stories.
            <br />
            Our data.
            <br />
            <span className="relative inline-block text-[#e3613f]">
              Our say.
              <svg
                aria-hidden="true"
                className="absolute -bottom-4 left-1 w-[96%] text-[#e3613f]"
                viewBox="0 0 390 22"
                fill="none"
              >
                <path
                  d="M3 15C104 4 263 5 387 12"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-11 max-w-xl text-lg leading-8 text-[#324d45] sm:text-xl">
            We’re building community-owned tools so African mental health data
            is governed with consent, protected with care, and used to create
            benefits that return home.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#auth-section"
              onClick={handleCtaClick}
              className="group flex items-center justify-center gap-3 rounded-full bg-[#173f34] px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0f3028]"
            >
              Help shape the pilot
              <span className="grid size-7 place-items-center rounded-full bg-[#f2ca56] text-[#173f34] transition-transform group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
            <a
              href="#principles"
              className="flex items-center justify-center rounded-full border border-[#173f34]/35 px-7 py-4 text-sm font-bold transition hover:border-[#173f34] hover:bg-white/40 text-[#173f34]"
            >
              Explore the model
            </a>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="relative mx-auto w-full max-w-[620px] lg:mx-0 lg:justify-self-end">
          <div className="absolute -left-10 -top-9 hidden size-28 rounded-full bg-[#f2ca56] lg:block" />
          <div className="absolute -right-24 bottom-3 hidden size-48 rounded-full border-[34px] border-[#e3613f] lg:block" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#244c40] after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:border after:border-white/30 after:content-[''] sm:rounded-[3rem] shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1755705152670-0cfe7829fd0e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200"
              alt="A group of African young adults laughing together outdoors"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 620px"
              className="h-full w-full object-cover object-[54%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102e27]/75 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 rounded-[1.4rem] border border-white/25 bg-[#173f34]/85 p-5 text-white backdrop-blur-md sm:bottom-7 sm:left-7 sm:right-7 sm:p-6">
              <p className="max-w-[290px] text-2xl leading-[1.05] [font-family:var(--font-dm-serif-display),serif] sm:text-3xl">
                Nothing about us, without us.
              </p>
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#f2ca56] text-[#173f34]">
                <ArrowUpRight className="size-5" />
              </span>
            </div>
          </div>
          <div className="absolute -left-4 top-8 rounded-full bg-[#fffaf0] px-4 py-2.5 text-xs font-bold shadow-lg sm:-left-8 sm:top-14 sm:px-5 text-[#172c26] border border-[#172c26]/10">
            Community-owned
          </div>
          <div className="absolute -right-3 top-[28%] rotate-3 rounded-full bg-[#e3613f] px-4 py-2.5 text-xs font-bold text-white shadow-lg sm:-right-7 sm:px-5">
            Consent-led
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section id="why" className="border-y border-[#173f34]/15 bg-[#fffaf0]">
        <div className="mx-auto grid max-w-[1440px] gap-7 px-5 py-8 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center lg:px-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e3613f]">
            Why this work matters
          </p>
          <p className="text-2xl leading-tight tracking-[-0.02em] [font-family:var(--font-dm-serif-display),serif] sm:text-3xl text-[#172c26]">
            Data should be a source of collective power—not something taken from
            the people who create it.
          </p>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section
        id="principles"
        className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-14 lg:py-28"
      >
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#e3613f]">
              Built differently
            </p>
            <h2 className="text-4xl tracking-[-0.035em] [font-family:var(--font-dm-serif-display),serif] sm:text-5xl text-[#172c26]">
              Three promises we keep.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#4b625b]">
            The commons is shaped with young people, lived-experience leaders,
            and community health workers.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map((principle) => (
            <article
              key={principle.number}
              className={`${principle.tone} group flex min-h-64 flex-col justify-between rounded-[1.75rem] p-6 transition-transform hover:-translate-y-1 sm:p-8 text-[#172c26] shadow-sm`}
            >
              <span className="font-mono text-xs font-bold">
                {principle.number}
              </span>
              <div className="flex items-end justify-between gap-4">
                <h3 className="max-w-[240px] text-3xl leading-[1.02] [font-family:var(--font-dm-serif-display),serif]">
                  {principle.title}
                </h3>
                <ArrowUpRight className="size-7 shrink-0 transition-transform group-hover:rotate-45" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PILOT */}
      <section id="pilot" className="bg-[#173f34] text-[#fffaf0]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center lg:px-14 lg:py-20">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#f2ca56]">
              The first pilot
            </p>
            <h2 className="text-4xl leading-[1.02] tracking-[-0.035em] [font-family:var(--font-dm-serif-display),serif] sm:text-5xl">
              Bring your experience to the table.
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#auth-section"
              onClick={handleCtaClick}
              className="group flex shrink-0 items-center gap-3 rounded-full bg-[#f2ca56] px-6 py-4 text-sm font-bold text-[#173f34] transition hover:bg-[#f6dc83]"
            >
              Launch Interactive Simulation
              <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
            </a>
            <a
              href="mailto:taiwoolugbenga2018@gmail.com?subject=I%20want%20to%20join%20the%20pilot"
              className="group flex shrink-0 items-center gap-3 rounded-full border border-white/30 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Register your interest
              <ArrowUpRight className="size-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
