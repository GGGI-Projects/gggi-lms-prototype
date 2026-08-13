"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FAQ } from "@/content/site";
import { Reveal } from "@/components/motion/primitives";

/**
 * Questions people actually ask before signing up - cost, prerequisites, time,
 * and whether the certificate means anything. Answering the cost question
 * first is deliberate: it is the one that stops people enrolling.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="scroll-mt-28 bg-surface py-24 sm:py-32">
      <div className="mx-auto grid max-w-editorial gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal>
            <p className="label-eyebrow text-primary">Questions</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display text-display-md mt-5 text-balance text-ink">
              Before you sign up.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="measure mt-5 text-[0.95rem] leading-relaxed text-ink-soft">
              Anything else, write to us and a person will answer.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-8">
          <dl className="border-t border-surface-deep">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              const panelId = `faq-panel-${i}`;

              return (
                <Reveal key={item.question} delay={i * 0.05}>
                  <div className="border-b border-surface-deep">
                    <dt>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="group flex w-full items-start justify-between gap-6 py-6 text-left"
                      >
                        <span
                          className={`font-display text-xl tracking-tight transition-colors duration-300 sm:text-[1.35rem] ${isOpen
                              ? "text-accent-strong"
                              : "text-ink group-hover:text-primary"
                            }`}
                        >
                          {item.question}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-surface-deep transition-transform duration-500 ease-out-expo ${isOpen ? "rotate-45 border-accent-strong text-accent-strong" : "text-muted"
                            }`}
                        >
                          <svg viewBox="0 0 14 14" className="size-3" fill="none">
                            <path
                              d="M7 1.5v11M1.5 7h11"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                      </button>
                    </dt>

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.dd
                          id={panelId}
                          initial={
                            reduce ? { height: "auto" } : { height: 0, opacity: 0 }
                          }
                          animate={{ height: "auto", opacity: 1 }}
                          exit={
                            reduce ? { height: "auto" } : { height: 0, opacity: 0 }
                          }
                          transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="measure-wide pb-7 pr-10 text-[0.95rem] leading-relaxed text-ink-soft">
                            {item.answer}
                          </p>
                        </motion.dd>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
