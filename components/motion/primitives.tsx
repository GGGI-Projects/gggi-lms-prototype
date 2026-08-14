"use client";

/**
 * Shared motion primitives.
 *
 * Every one of these degrades to "no movement, content still visible" when the
 * visitor has `prefers-reduced-motion: reduce` set. That matters here: the
 * audience includes people on older government machines and slow connections,
 * and a landing page that hides its content behind an animation that never
 * runs is worse than one with no animation at all.
 */

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ Reveal */

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before starting. */
  delay?: number;
  /** Distance in px the element rises from. */
  y?: number;
  duration?: number;
};

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  duration = 0.85,
}: RevealProps) {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();

  // Until React has hydrated - and always, for reduced motion - render plain
  // visible markup. This keeps the hidden state out of the server HTML, so the
  // page reads correctly if JS is slow, blocked or fails. The swap happens at
  // hydration, while these elements are still below the fold.
  if (!hydrated || reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------------------------------------------- Stagger */

const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 26 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/** Wrap a list; each `<StaggerItem>` inside animates in 90ms after the last. */
export function Stagger({
  children,
  className,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();

  if (!hydrated || reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();

  // Must gate on exactly the same condition as `Stagger`, so parent and child
  // always agree about whether variants are orchestrating them.
  if (!hydrated || reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------- WordReveal */

/**
 * Splits a headline on spaces and lifts each word in turn from behind a mask.
 * Used once, on the hero - it is the most expensive-looking effect on the page
 * and loses its impact if repeated.
 *
 * Driven by CSS animation rather than `motion`, deliberately: the words sit in
 * the server HTML and animate off the stylesheet, so the headline is never
 * blank waiting for JS. Reduced motion is handled by the global override in
 * globals.css, which collapses the duration onto the finished state.
 */
export function WordReveal({
  text,
  className,
  delay = 0,
  /** Words matched here get the accent underline, for the emphasised phrase. */
  accent = [],
}: {
  text: string;
  className?: string;
  delay?: number;
  accent?: string[];
}) {
  const accentSet = new Set(accent.map((w) => w.toLowerCase()));

  // Contiguous accent words are merged into a single token, including the
  // space between them. Underlining word-by-word leaves a visible gap at every
  // space; merging makes the rule run unbroken beneath the whole phrase.
  const tokens: { text: string; accent: boolean }[] = [];
  for (const word of text.split(" ")) {
    const bare = word.replace(/[^\p{L}\p{N}-]/gu, "").toLowerCase();
    const isAccent = accentSet.has(bare);
    const previous = tokens.at(-1);

    if (isAccent && previous?.accent) {
      previous.text += ` ${word}`;
    } else {
      tokens.push({ text: word, accent: isAccent });
    }
  }

  return (
    <span className={className}>
      {tokens.map((token, i) => (
        <Fragment key={`${token.text}-${i}`}>
          <span className="inline-block overflow-hidden align-bottom pb-[0.3em] -mb-[0.3em]">
            <span
              className={`animate-word inline-block ${token.accent
                  ? "underline decoration-accent decoration-[0.07em] underline-offset-[0.09em]"
                  : ""
                }`}
              style={{ animationDelay: `${delay + i * 0.075}s` }}
            >
              {token.text}
            </span>
          </span>
          {/* The separator has to live outside the mask: a trailing space
              inside an inline-block with overflow-hidden is collapsed away,
              which runs the words together. */}
          {i < tokens.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------- Parallax */

/**
 * Translates its children vertically as the section scrolls through the
 * viewport. `distance` is in px; negative moves against the scroll.
 */
export function Parallax({
  children,
  distance = 80,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const y = useSpring(raw, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------- Magnetic */

/**
 * Pulls its child toward the cursor. Pointer-fine devices only - on a phone
 * there is no cursor to be magnetic toward, and the extra listeners are waste.
 */
export function Magnetic({
  children,
  className,
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 20, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 220, damping: 20, mass: 0.35 });
  const enabled = usePointerFine() && !reduce;

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------------------------------------------- Counter */

/**
 * Counts up to `value` the first time it enters the viewport.
 *
 * Renders the *final* value on the server, not zero - these are the numbers
 * that tell a visitor what they are signing up for, and a page that says "0
 * modules" because JS never ran is worse than one that simply does not count.
 */
export function Counter({
  value,
  suffix = "",
  prefix = "",
  duration = 1.6,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ---------------------------------------------------------- ScrollProgress */

/** Hairline reading-progress bar pinned to the very top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-70 h-0.5 origin-left bg-accent"
    />
  );
}

/* -------------------------------------------------------------- CursorGlow */

/**
 * A soft sage halo that trails the cursor. Ambient only; it sits under the
 * content and never intercepts pointer events.
 *
 * The paint - size, colour, blend, and the gradient that replaced a `blur(90px)`
 * filter - is `.cursor-glow` in globals.css, where there is room to explain it.
 * What matters here is the property being animated.
 *
 * `x`/`y`, NOT `left`/`top`. Those two motion values used to be handed to the
 * inset properties, which meant every frame of every mouse movement went
 * through layout before it could paint - on a 704px element with a full-page
 * blend mode, on the main thread, at pointer frequency. As a transform it is
 * a compositor translate of an already-rasterised layer.
 */
export function CursorGlow() {
  const reduce = useReducedMotion();
  const fine = usePointerFine();
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);
  const sx = useSpring(x, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (!fine || reduce) return;
    function onMove(event: MouseEvent) {
      x.set(event.clientX);
      y.set(event.clientY);
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [fine, reduce, x, y]);

  if (!fine || reduce) return null;

  return <motion.div aria-hidden="true" style={{ x: sx, y: sy }} className="cursor-glow" />;
}

/* ------------------------------------------------------------------- hooks */

/**
 * False during server rendering and the first client render, true afterwards.
 *
 * Components use this to keep their hidden "before the animation" state out of
 * the server HTML. Without it, `initial={{ opacity: 0 }}` is serialised as
 * `style="opacity:0"`, and every visitor whose JS is slow, blocked or broken
 * gets a page of invisible sections.
 */
export function useHydrated() {
  // The server snapshot is `false` and the client snapshot is `true`, so this
  // flips exactly once, at hydration, with no effect and no cascading render.
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

/** A store that never changes - the value comes entirely from the snapshots. */
const subscribeNever = () => () => { };

/** True when the primary pointer is a mouse/trackpad rather than a finger. */
function usePointerFine() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(POINTER_FINE);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(POINTER_FINE).matches,
    // Assume coarse on the server: the effects it gates are enhancements, and
    // starting them off avoids a hydration mismatch on touch devices.
    () => false,
  );
}

const POINTER_FINE = "(pointer: fine)";
