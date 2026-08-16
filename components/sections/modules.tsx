"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BRAND } from "@/lib/brand";
import { ActionButton } from "@/components/ui/action-button";
import { MODULES, type Module } from "@/content/site";
import { ModuleScene } from "@/components/art/scenes";
import { Reveal, useHydrated } from "@/components/motion/primitives";
import { BODY, CONTAINER, EYEBROW, HEADING, META, SECTION } from "@/lib/theme";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The heart of the page.
 *
 * Rendered as an editorial list rather than a card grid: oversized outlined
 * numerals, full-width rules, and detail that opens in place. Expanding in
 * place matters for the prototype specifically - the module detail pages do
 * not exist yet, so a row that navigated anywhere would dead-end during a
 * client demo. This gives the same sense of depth with nowhere to fall.
 */
export function Modules() {
  const [openId, setOpenId] = useState<string | null>(MODULES[0].id);

  return (
    <section id="modules" className={`bg-paper ${SECTION.y}`}>
      <div className={CONTAINER}>
        <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className={EYEBROW.accent}>The modules</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className={HEADING.section}>
                Five foundations. Start where your work does.
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <Reveal delay={0.16}>
              <p className={`measure ${BODY.base} lg:ml-auto`}>
                Each one is self-contained, so there is no order to follow and
                nothing to complete first. Enrol in as many as you like - they
                are all free, and your progress is kept separately for each.
              </p>
            </Reveal>
          </div>
        </header>

        <div className="mt-16 border-b border-surface-deep">
          {MODULES.map((mdl, index) => (
            <ModuleRow
              key={mdl.id}
              module={mdl}
              index={index}
              open={openId === mdl.id}
              onToggle={() =>
                setOpenId((current) =>
                  current === mdl.id ? null : mdl.id,
                )
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ModuleRow({
  module: mdl,
  index,
  open,
  onToggle,
}: {
  module: Module;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();
  const panelId = `module-panel-${mdl.id}`;

  return (
    <motion.article
      initial={hydrated && !reduce ? { opacity: 0, y: 34 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.8, delay: index * 0.07, ease: EASE }}
      className="group relative border-t border-surface-deep"
    >
      {/* Hover wash, wiping up from the baseline. Warm, not mint: this section
          is pitched bronze, and a teal wash under a bronze numeral was the one
          place two hues met on the same element. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-accent-pale/70 transition-transform duration-500 ease-out-expo group-hover:scale-y-100"
      />

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="relative flex w-full flex-col gap-5 py-8 text-left sm:flex-row sm:items-center sm:gap-8 sm:py-9"
      >
        {/* Outlined numeral, filling in on hover or when open.
            The resting outline is neutral rather than teal, so bronze on the
            open row is the only colour in the list and the eye goes straight
            to it. A teal outline on every closed row competed with it. */}
        <span
          aria-hidden="true"
          className={`text-numeral shrink-0 select-none transition-colors duration-500 sm:w-[4.5ch] ${open
            ? "text-accent-strong [-webkit-text-stroke:0px_transparent]"
            : "text-transparent [-webkit-text-stroke:1.2px_var(--color-muted-light)] group-hover:text-accent-600"
            }`}
        >
          {mdl.number}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className={HEADING.card}>
              {mdl.title}
            </span>
            <span className={`rounded-full border border-surface-deep bg-paper px-2.5 py-0.5 font-medium ${META.base}`}>
              {mdl.level}
            </span>
          </span>
          <span className={`measure-wide mt-3 block ${BODY.base}`}>
            {mdl.summary}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-6 sm:gap-8">
          <span className="hidden text-right leading-tight md:block">
            <span className="block font-display text-lg text-ink">
              {mdl.lectures}
            </span>
            <span className={`block ${META.base}`}>lectures</span>
            <span className="mt-2 block font-display text-lg text-ink">
              {mdl.hours}h
            </span>
            <span className={`block ${META.base}`}>of material</span>
          </span>

          <ModuleScene
            scene={mdl.scene}
            className="h-20 w-28 shrink-0 rounded-md object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04] sm:h-24 sm:w-36"
          />

          <span
            aria-hidden="true"
            className={`grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-out-expo group-hover:bg-paper ${open
              ? "rotate-45 border-accent-strong/50 text-accent-strong"
              : "border-surface-deep text-muted group-hover:border-accent-strong/40 group-hover:text-accent-strong"
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
                <p className={EYEBROW.muted}>What you will cover</p>
                <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {mdl.topics.map((topic, i) => (
                    <motion.li
                      key={topic}
                      initial={hydrated && !reduce ? { opacity: 0, x: -12 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + i * 0.06, duration: 0.5 }}
                      className={`flex items-start gap-3 ${BODY.base}`}
                    >
                      <span className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-accent" />
                      {topic}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="sm:col-span-5">
                <div className="rounded-lg border border-surface-deep bg-paper-raised py-10 px-8">
                  <p className={BODY.base}>
                    Complete all {mdl.lectures} lectures and their quizzes to
                    earn the{" "}
                    <span className="font-medium text-ink">
                      {mdl.title}
                    </span>{" "}
                    certificate.
                  </p>
                  <div className="mt-4">
                    <ActionButton
                      href={BRAND.routes.signup}
                      variant="solid"
                      size="sm"
                      className="group/cta"
                    >
                      Enrol for free
                      <span className="transition-transform duration-500 ease-out-expo group-hover/cta:translate-x-1">
                        →
                      </span>
                    </ActionButton>
                  </div>
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
