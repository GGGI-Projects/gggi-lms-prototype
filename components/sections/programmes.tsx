"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { PROGRAMMES, type Programme } from "@/content/site";
import { ProgrammeScene } from "@/components/art/scenes";
import { Reveal, useHydrated } from "@/components/motion/primitives";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The heart of the page.
 *
 * Rendered as an editorial list rather than a card grid: oversized outlined
 * numerals, full-width rules, and detail that opens in place. Expanding in
 * place matters for the prototype specifically - the programme detail pages do
 * not exist yet, so a row that navigated anywhere would dead-end during a
 * client demo. This gives the same sense of depth with nowhere to fall.
 */
export function Programmes() {
  const [openId, setOpenId] = useState<string | null>(PROGRAMMES[0].id);

  return (
    <section id="programmes" className="scroll-mt-28 bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="label-eyebrow text-primary">The programmes</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="font-display text-display-lg mt-5 text-balance text-ink">
                Five foundations. Start where your work does.
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <Reveal delay={0.16}>
              <p className="measure text-base leading-relaxed text-ink-soft lg:ml-auto">
                Each one is self-contained, so there is no order to follow and
                nothing to complete first. Enrol in as many as you like - they
                are all free, and your progress is kept separately for each.
              </p>
            </Reveal>
          </div>
        </header>

        <div className="mt-16 border-b border-surface-deep">
          {PROGRAMMES.map((programme, index) => (
            <ProgrammeRow
              key={programme.id}
              programme={programme}
              index={index}
              open={openId === programme.id}
              onToggle={() =>
                setOpenId((current) =>
                  current === programme.id ? null : programme.id,
                )
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgrammeRow({
  programme,
  index,
  open,
  onToggle,
}: {
  programme: Programme;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();
  const panelId = `programme-panel-${programme.id}`;

  return (
    <motion.article
      initial={hydrated && !reduce ? { opacity: 0, y: 34 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, delay: index * 0.07, ease: EASE }}
      className="group relative border-t border-surface-deep"
    >
      {/* Hover wash, wiping up from the baseline. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-tint-mist/60 transition-transform duration-500 ease-out-expo group-hover:scale-y-100"
      />

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="relative flex w-full flex-col gap-5 py-8 text-left sm:flex-row sm:items-center sm:gap-8 sm:py-9"
      >
        {/* Outlined numeral, filling in on hover or when open. */}
        <span
          aria-hidden="true"
          className={`text-numeral shrink-0 select-none transition-colors duration-500 sm:w-[4.5ch] ${open
              ? "text-accent-strong [-webkit-text-stroke:0px_transparent]"
              : "text-transparent [-webkit-text-stroke:1.2px_var(--color-primary-600)] group-hover:text-primary-600"
            }`}
        >
          {programme.number}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-display text-2xl tracking-tight text-ink sm:text-[1.7rem]">
              {programme.title}
            </span>
            <span className="rounded-full border border-surface-deep bg-paper px-2.5 py-0.5 text-[0.7rem] font-medium text-muted">
              {programme.level}
            </span>
          </span>
          <span className="measure-wide mt-3 block text-[0.95rem] leading-relaxed text-ink-soft">
            {programme.summary}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-6 sm:gap-8">
          <span className="hidden text-right leading-tight md:block">
            <span className="block font-display text-xl text-primary">
              {programme.modules}
            </span>
            <span className="block text-[0.72rem] text-muted">modules</span>
            <span className="mt-2 block font-display text-xl text-primary">
              {programme.hours}h
            </span>
            <span className="block text-[0.72rem] text-muted">of material</span>
          </span>

          <ProgrammeScene
            scene={programme.scene}
            className="h-20 w-28 shrink-0 rounded-md object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04] sm:h-24 sm:w-36"
          />

          <span
            aria-hidden="true"
            className={`grid size-10 shrink-0 place-items-center rounded-full border border-primary/25 text-primary transition-all duration-500 ease-out-expo group-hover:border-primary/50 group-hover:bg-paper ${open ? "rotate-45" : ""
              }`}
          >
            <PlusIcon className="size-4" />
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            key="panel"
            initial={reduce ? { height: "auto" } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { height: "auto" } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            className="relative overflow-hidden"
          >
            <div className="grid gap-8 pb-10 sm:grid-cols-12 sm:gap-10 sm:pl-[calc(4.5ch+2rem)]">
              <div className="sm:col-span-7">
                <p className="label-eyebrow text-muted">What you will cover</p>
                <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {programme.topics.map((topic, i) => (
                    <motion.li
                      key={topic}
                      initial={hydrated && !reduce ? { opacity: 0, x: -12 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + i * 0.06, duration: 0.5 }}
                      className="flex items-start gap-3 text-[0.92rem] text-ink-soft"
                    >
                      <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-accent" />
                      {topic}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="sm:col-span-5">
                <div className="rounded-lg border border-surface-deep bg-paper-raised p-5">
                  <p className="text-[0.9rem] leading-relaxed text-ink-soft">
                    Complete all {programme.modules} modules and their quizzes to
                    earn the{" "}
                    <span className="font-medium text-ink">
                      {programme.title}
                    </span>{" "}
                    certificate.
                  </p>
                  <Link
                    href={BRAND.routes.signup}
                    className="group/cta mt-4 inline-flex items-center gap-2 text-[0.9rem] font-medium text-primary"
                  >
                    Enrol for free
                    <span className="transition-transform duration-500 ease-out-expo group-hover/cta:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2v12M2 8h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
