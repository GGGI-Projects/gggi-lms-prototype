"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { JOURNEY, type JourneyStep } from "@/content/site";
import { useHydrated } from "@/components/motion/primitives";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Y coordinates of each node on the serpentine path, in SVG user units. */
const NODE_Y = [20, 160, 300, 440, 580];

/**
 * Pinned scroll storytelling: the section sticks to the viewport while the
 * page scrolls through it, drawing a path from sign-up to certificate one step
 * at a time.
 *
 * Only on large screens. Pinning a tall section on a phone means a long, dead
 * scroll with a cramped viewport, so below `lg` the same content renders as an
 * ordinary vertical list - same information, no hijacked scrolling.
 */
export function Journey() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-0 bg-primary-950 text-tint-pale"
    >
      <PinnedJourney />
      <StackedJourney />
    </section>
  );
}

/* ------------------------------------------------------------- desktop */

function PinnedJourney() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Drive the drawn path slightly ahead of the text, so the line arrives at a
  // node just before its copy swaps in.
  const rawLength = useTransform(scrollYProgress, [0.02, 0.94], [0.02, 1]);
  const pathLength = useSpring(rawLength, {
    stiffness: 80,
    damping: 26,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.min(
      JOURNEY.length - 1,
      Math.max(0, Math.floor(progress * JOURNEY.length)),
    );
    setActive(next);
  });

  const step = JOURNEY[active];

  return (
    <div
      ref={ref}
      className="relative hidden lg:block"
      style={{ height: `${JOURNEY.length * 105}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Ambient glow that follows the active step down the section. */}
        <motion.div
          aria-hidden="true"
          animate={{ top: `${12 + active * 17}%` }}
          transition={{ duration: 1.1, ease: EASE }}
          className="pointer-events-none absolute right-[18%] size-136 -translate-y-1/2 rounded-full bg-primary-600/25 blur-[110px]"
        />

        <div className="mx-auto grid w-full max-w-editorial grid-cols-12 items-center gap-12 px-8">
          {/* ------------------------------------------------ copy column */}
          <div className="col-span-7 pr-10">
            <p className="label-eyebrow text-accent-soft">How it works</p>
            <h2 className="font-display text-display-lg mt-5 text-balance text-paper">
              From sign-up to certificate.
            </h2>
            <p className="measure mt-5 text-base leading-relaxed text-tint">
              Five steps, no gatekeeping at any of them. Most people finish
              their first programme inside a month.
            </p>

            <div className="mt-14 min-h-60">
              {/* `initial={false}` skips the enter animation for the first
                  step only, which also keeps it out of the server HTML as
                  opacity:0. Later step changes still crossfade. */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step.number}
                  initial={reduce ? false : { opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.55, ease: EASE }}
                >
                  <StepBody step={step} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Step counter + segmented progress. */}
            <div className="mt-10 flex items-center gap-5">
              <span className="font-display text-sm tabular-nums text-tint">
                {step.number}
                <span className="text-primary-600"> / 0{JOURNEY.length}</span>
              </span>
              <div className="flex flex-1 gap-1.5">
                {JOURNEY.map((item, i) => (
                  <span
                    key={item.number}
                    className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${i <= active ? "bg-accent" : "bg-primary-800"
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------ path column */}
          <div className="col-span-5 flex justify-center">
            <svg
              aria-hidden="true"
              viewBox="0 0 200 600"
              className="h-[74vh] w-auto overflow-visible"
              fill="none"
            >
              {/* Unwalked path */}
              <path
                d={SERPENTINE}
                stroke="var(--color-primary-800)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Walked path, drawn by scroll */}
              <motion.path
                d={SERPENTINE}
                stroke="var(--color-accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={reduce ? { pathLength: 1 } : { pathLength }}
              />

              {NODE_Y.map((y, i) => {
                const reached = i <= active;
                return (
                  <g key={y}>
                    {reached ? (
                      <motion.circle
                        cx="100"
                        cy={y}
                        r="20"
                        fill="var(--color-accent)"
                        initial={{ opacity: 0.35, scale: 0.8 }}
                        animate={
                          i === active
                            ? { opacity: [0.3, 0.05, 0.3], scale: [1, 1.5, 1] }
                            : { opacity: 0, scale: 1 }
                        }
                        transition={
                          i === active
                            ? { duration: 2.6, repeat: Infinity }
                            : { duration: 0.5 }
                        }
                      />
                    ) : null}
                    <motion.circle
                      cx="100"
                      cy={y}
                      r="11"
                      animate={{
                        fill: reached
                          ? "var(--color-accent)"
                          : "var(--color-primary-950)",
                        stroke: reached
                          ? "var(--color-accent)"
                          : "var(--color-primary-800)",
                        scale: i === active ? 1.25 : 1,
                      }}
                      transition={{ duration: 0.5, ease: EASE }}
                      strokeWidth="2"
                    />
                    <motion.text
                      x="100"
                      y={y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="font-display text-[11px]"
                      animate={{
                        fill: reached
                          ? "var(--color-primary-950)"
                          : "var(--color-primary-600)",
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      {i + 1}
                    </motion.text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- mobile */

function StackedJourney() {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();

  return (
    <div className="px-5 py-24 sm:px-8 lg:hidden">
      <p className="label-eyebrow text-accent-soft">How it works</p>
      <h2 className="font-display text-display-lg mt-4 text-balance text-paper">
        From sign-up to certificate.
      </h2>
      <p className="mt-4 text-base leading-relaxed text-tint">
        Five steps, no gatekeeping at any of them.
      </p>

      <ol className="mt-12 space-y-10">
        {JOURNEY.map((step, i) => (
          <motion.li
            key={step.number}
            initial={hydrated && !reduce ? { opacity: 0, y: 26 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative pl-12"
          >
            <span className="absolute left-0 top-0 grid size-8 place-items-center rounded-full border border-accent bg-accent font-display text-sm text-primary-950">
              {i + 1}
            </span>
            {i < JOURNEY.length - 1 ? (
              <span className="absolute -bottom-10 left-4 top-10 w-px bg-primary-800" />
            ) : null}
            <StepBody step={step} compact />
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/* --------------------------------------------------------------- shared */

function StepBody({
  step,
  compact = false,
}: {
  step: JourneyStep;
  compact?: boolean;
}) {
  return (
    <>
      <h3
        className={`font-display tracking-tight text-paper ${compact ? "text-2xl" : "text-[2.4rem] leading-tight"
          }`}
      >
        {step.title}
      </h3>
      <p
        className={`measure mt-3 leading-relaxed text-tint ${compact ? "text-[0.95rem]" : "text-lg"
          }`}
      >
        {step.body}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary-800 px-3.5 py-1.5 text-[0.75rem] font-medium text-accent-soft">
        <span className="size-1.5 rounded-full bg-accent" />
        {step.detail}
      </span>
    </>
  );
}

const SERPENTINE =
  "M100 20 C160 60 160 120 100 160 C40 200 40 260 100 300 C160 340 160 400 100 440 C40 480 40 540 100 580";
