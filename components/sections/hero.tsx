"use client";

import { AnimatePresence, motion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { TOTALS } from "@/content/site";
import { SEASONS } from "@/content/seasons";
import { Globe } from "@/components/art/globe";
import { Counter, WordReveal } from "@/components/motion/primitives";
import { ActionButton } from "@/components/ui/action-button";
import { SeasonParticles } from "@/components/hero/season-particles";
import { YearRibbon } from "@/components/hero/year-ribbon";
import { useSeason } from "@/components/hero/season-provider";

/**
 * The hero is not a page. It is a view of the Earth, and time is passing.
 *
 * Every animated thing here is a readout of one simulated moment in the year -
 * the sky, the light on the globe, the tilt of the terminator, the words. They
 * move together because they all read the same CSS-owned clock (see
 * docs/seasonal-hero.md), not because anything synchronises them.
 *
 * The entrance still runs on CSS animations rather than `motion`, for the same
 * reason as before: the hero must be painted and readable straight from the
 * server HTML, on a slow machine, with JavaScript still loading.
 */
export function Hero() {
  const { index, jumpTo } = useSeason();
  const season = SEASONS[index];

  return (
    <section
      className="relative isolate overflow-hidden pt-(--header-h)"
      style={{ backgroundColor: "var(--season-ground, #0b2b24)" }}
    >
      {/* Sky. Not a flat colour - a gradient lit from where the sun is. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-30"
        style={{
          background:
            "radial-gradient(125% 105% at 16% -5%, var(--season-ground-2, #12463a), var(--season-ground, #0b2b24) 62%)",
        }}
      />

      {/* The Earth: oversized and cropped by the viewport, not a polite circle
          in a column. The headline sits over its limb. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-20 bottom-[-34%] left-1/2 h-[78vh] w-[78vh] max-w-none -translate-x-1/2 sm:bottom-[-26%] sm:left-auto sm:right-[-26%] sm:h-[96vh] sm:w-[96vh] sm:translate-x-0 lg:bottom-auto lg:right-[-22%] lg:top-1/2 lg:h-[146vh] lg:w-[146vh] lg:-translate-y-1/2"
      >
        <Globe className="h-full w-full" />
      </div>

      {/* Scrim, so type stays legible where it crosses the globe. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(100deg, var(--season-ground, #0b2b24) 0%, color-mix(in oklab, var(--season-ground, #0b2b24) 88%, transparent) 34%, transparent 66%)",
        }}
      />

      <SeasonParticles index={index} />

      {/* The season arrives as a light sweep on the terminator's diagonal,
          not a crossfade. */}
      <div aria-hidden="true" className="season-sweep -z-10" />

      <div className="px-fluid relative grid w-full grid-cols-1 items-center gap-12 pb-20 pt-10 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-12 lg:gap-10 lg:pb-28 lg:pt-16">
        <div className="lg:col-span-7 lg:pr-10">
          <p
            className="animate-rise label-eyebrow inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5"
            style={{
              animationDelay: "0.15s",
              color: "var(--season-text-muted, #9dc4b4)",
              border:
                "1px solid color-mix(in oklab, var(--season-text, #eaf7f0) 18%, transparent)",
              backgroundColor:
                "color-mix(in oklab, var(--season-ground, #0b2b24) 60%, transparent)",
            }}
          >
            <span className="relative flex size-1.5">
              <span
                className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
                style={{ backgroundColor: "var(--season-accent, #5fe0a8)" }}
              />
              <span
                className="relative inline-flex size-1.5 rounded-full"
                style={{ backgroundColor: "var(--season-accent, #5fe0a8)" }}
              />
            </span>
            Now open in {BRAND.country}
          </p>

          <h1
            className="font-display text-display-xl mt-5 text-balance"
            style={{ color: "var(--season-text, #eaf7f0)" }}
          >
            <span className="block">
              <WordReveal
                text="Build the foundations of Sri Lanka's"
                delay={0.2}
              />
            </span>

            {/* Canonical phrase for assistive tech, so nothing is announced
                every six seconds. */}
            <span className="sr-only">{SEASONS[0].phrase}.</span>

            <span
              aria-hidden="true"
              className="mt-1.5 block min-h-[1.15em] whitespace-nowrap"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={season.key}
                  initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block"
                >
                  {/* Re-mounted each season, so the underline restarts its
                      fill exactly on the boundary. */}
                  <span className="season-underline inline-block">
                    {season.phrase}
                  </span>
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          {/* The one line that changes, plus a real number. */}
          <div className="mt-5 min-h-[3.25rem]">
            <span className="sr-only">{SEASONS[0].line}</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={season.key}
                aria-hidden="true"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <p
                  className="text-lg font-medium"
                  style={{ color: "var(--season-text, #eaf7f0)" }}
                >
                  {season.line}
                </p>
                <p
                  className="mt-1.5 text-[0.8rem] tracking-wide"
                  style={{ color: "var(--season-text-muted, #9dc4b4)" }}
                >
                  {season.fact}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Fixed. The core message never moves. */}
          <p
            className="animate-rise measure mt-6 leading-relaxed"
            style={{
              animationDelay: "0.95s",
              color: "var(--season-text-muted, #9dc4b4)",
            }}
          >
            Free, self-paced programmes for the people who put climate policy
            into practice - with a certificate at the end of each.
          </p>

          <div
            className="animate-rise mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            style={{ animationDelay: "1.1s" }}
          >
            <ActionButton
              href={BRAND.routes.signup}
              variant="filled"
              className="group w-full px-8 py-4 text-base font-semibold sm:w-auto"
            >
              Start learning - it&rsquo;s free
              <ArrowRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
            </ActionButton>

            <ActionButton
              href="#programmes"
              variant="outlined"
              className="group w-full px-8 py-4 text-base font-medium sm:w-auto"
            >
              Browse the programmes
              <span className="transition-transform duration-500 ease-out-expo group-hover:translate-y-0.5">
                ↓
              </span>
            </ActionButton>
          </div>

          {/* The year, as a control. Also how you demo winter without waiting
              24 seconds for it to arrive. */}
          {/* <YearRibbon
            index={index}
            onSelect={jumpTo}
            className="animate-rise mt-8 max-w-md"
          /> */}

          <dl
            className="animate-rise mt-7 grid max-w-lg grid-cols-2 gap-x-6 gap-y-6 pt-6 sm:grid-cols-4 sm:gap-x-4"
            style={{
              animationDelay: "1.25s",
              borderTop:
                "1px solid color-mix(in oklab, var(--season-text, #eaf7f0) 15%, transparent)",
            }}
          >
            <Stat label="Programmes">
              <Counter value={TOTALS.programmes} />
            </Stat>
            <Stat label="Modules">
              <Counter value={TOTALS.modules} />
            </Stat>
            <Stat label="Hours of material">
              <Counter value={TOTALS.hours} />
            </Stat>
            <Stat label="Cost to enrol">
              <span style={{ color: "var(--season-accent, #5fe0a8)" }}>Free</span>
            </Stat>
          </dl>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd
        className="font-display text-3xl leading-none sm:text-[2.1rem]"
        style={{ color: "var(--season-text, #eaf7f0)" }}
      >
        {children}
      </dd>
      <p
        className="mt-2 text-[0.78rem] leading-snug"
        style={{ color: "var(--season-text-muted, #9dc4b4)" }}
      >
        {label}
      </p>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 8h12m0 0-4.5-4.5M14 8l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
