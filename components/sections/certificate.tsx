"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { BRAND } from "@/lib/brand";
import { PROGRAMMES } from "@/content/site";
import { LeafMark } from "@/components/art/scenes";
import { Reveal, useHydrated } from "@/components/motion/primitives";

const GUARANTEES = [
  "A unique reference number on every certificate",
  "Checkable by anyone you show it to",
  "Download as PDF, or share a link",
  "Yours permanently - one per programme completed",
];

/**
 * The credential is the actual product here: people finish a programme in
 * order to hold up proof. So the certificate gets its own section and its own
 * hero treatment rather than being a bullet point further down.
 */
export function Certificate() {
  return (
    <section id="certificate" className="scroll-mt-28 bg-surface py-24 sm:py-32">
      <div className="mx-auto grid max-w-editorial items-center gap-16 px-5 sm:px-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="label-eyebrow text-primary">The certificate</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display text-display-lg mt-5 text-balance text-ink">
              Proof you can put in front of someone.
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="measure mt-6 text-lg leading-relaxed text-ink-soft">
              Complete every module and pass every quiz in a programme, and the
              certificate issues straight away - carrying your name, the
              programme, the date, and a reference number that can be checked
              against the register.
            </p>
          </Reveal>

          <ul className="mt-9 space-y-4">
            {GUARANTEES.map((item, i) => (
              <Reveal key={item} delay={0.2 + i * 0.07}>
                <li className="flex items-start gap-3.5 text-[0.95rem] text-ink-soft">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-paper">
                    <CheckIcon className="size-3" />
                  </span>
                  {item}
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.5}>
            <Link
              href={BRAND.routes.signup}
              className="group mt-10 inline-flex items-center gap-2.5 text-base font-medium text-primary"
            >
              Start your first programme
              <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <TiltCertificate />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- tilting card */

function TiltCertificate() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const hydrated = useHydrated();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 20, mass: 0.4 };
  const sx = useSpring(rotateX, springConfig);
  const sy = useSpring(rotateY, springConfig);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    // Inverted on X so the card leans toward the cursor, not away from it.
    rotateX.set(-py * 12);
    rotateY.set(px * 14);
  }

  function reset() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      initial={hydrated && !reduce ? { opacity: 0, y: 44, rotate: -2.5 } : false}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
      className="[perspective:1400px]"
    >
      <motion.div
        style={
          reduce
            ? undefined
            : { rotateX: sx, rotateY: sy, transformStyle: "preserve-3d" }
        }
        className="relative mx-auto w-full max-w-2xl"
      >
        {/* Stacked sheets behind, hinting that one exists per programme. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-6 -bottom-3 h-full rounded-lg border border-surface-deep bg-paper-raised/50"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-3 -bottom-1.5 h-full rounded-lg border border-surface-deep bg-paper-raised/75"
        />

        <div className="grain relative overflow-hidden rounded-lg border border-surface-deep bg-paper-raised p-7 shadow-[0_36px_70px_-38px_rgba(26,24,19,0.6)] sm:p-11">
          {/* Inner rule, the way an actual certificate is bordered. */}
          <div className="pointer-events-none absolute inset-3 rounded-md border border-tint-pale sm:inset-5" />

          <div className="relative flex items-start justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-full bg-primary text-tint-pale">
                <LeafMark className="size-4" />
              </span>
              <span className="font-display text-[0.95rem] leading-none tracking-tight text-ink">
                {BRAND.name}
                {BRAND.suffix ? (
                  <span className="text-muted"> {BRAND.suffix}</span>
                ) : null}
              </span>
            </div>
            <span className="label-eyebrow text-right text-muted">
              Certificate
              <br />
              of completion
            </span>
          </div>

          <div className="relative mt-10 sm:mt-14">
            <p className="text-[0.8rem] text-muted">This certifies that</p>
            <p className="font-display mt-2 border-b border-dashed border-surface-deep pb-2 text-3xl tracking-tight text-ink sm:text-[2.6rem]">
              Your name
            </p>
            <p className="mt-5 text-[0.8rem] text-muted">
              has completed all modules and assessments in
            </p>
            <p className="font-display mt-1.5 text-xl tracking-tight text-primary sm:text-2xl">
              {PROGRAMMES[0].title}
            </p>
          </div>

          <div className="relative mt-10 flex flex-wrap items-end justify-between gap-6 sm:mt-14">
            <dl className="grid grid-cols-2 gap-x-10 gap-y-3 text-[0.78rem] sm:grid-cols-3">
              <Field label="Modules" value={`${PROGRAMMES[0].modules} of ${PROGRAMMES[0].modules}`} />
              <Field label="Issued" value="13 August 2026" />
              <Field label="Reference" value="GP-2026-04817" mono />
            </dl>

            <Seal />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd
        className={`mt-0.5 font-medium text-ink ${mono ? "tabular-nums tracking-tight" : ""
          }`}
      >
        {value}
      </dd>
    </div>
  );
}

function Seal() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 96"
      className="size-20 shrink-0 text-accent-strong sm:size-24"
      fill="none"
    >
      {/* Scalloped edge */}
      <path
        d={scallop(48, 48, 40, 34, 24)}
        fill="var(--color-accent-pale)"
        stroke="currentColor"
        strokeOpacity="0.35"
      />
      <circle
        cx="48"
        cy="48"
        r="29"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeDasharray="2 4"
      />
      <g transform="translate(36 34) scale(0.75)">
        <path
          d="M5 27C5 27 6.5 17.5 13 12.5C19.5 7.5 27 8 27 8C27 8 27.5 16.5 21.5 21.5C15.5 26.5 8 25 8 25"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text
        x="48"
        y="72"
        textAnchor="middle"
        className="font-display text-[8px] uppercase"
        fill="currentColor"
        letterSpacing="1.5"
      >
        Verified
      </text>
    </svg>
  );
}

/** Builds the scalloped outline of the seal as a single path. */
function scallop(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  points: number,
) {
  const step = (Math.PI * 2) / points;
  let d = "";
  for (let i = 0; i < points; i++) {
    const angle = i * step;
    const mid = angle + step / 2;
    const x1 = cx + Math.cos(angle) * inner;
    const y1 = cy + Math.sin(angle) * inner;
    const cxp = cx + Math.cos(mid) * outer;
    const cyp = cy + Math.sin(mid) * outer;
    const x2 = cx + Math.cos(angle + step) * inner;
    const y2 = cy + Math.sin(angle + step) * inner;
    d += i === 0 ? `M${x1} ${y1}` : "";
    d += ` Q${cxp} ${cyp} ${x2} ${y2}`;
  }
  return `${d}Z`;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="m2.5 6.5 2.5 2.5 4.5-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
