"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PARTICLES, SEASONS } from "@/content/seasons";
import { useHydrated } from "@/components/motion/primitives";

/**
 * The seasonal weather.
 *
 * Sri Lankan, not imported - monsoon rain rather than snow, dry-season dust
 * rather than falling leaves. Colour comes from `--season-accent`, so the
 * field re-tints itself as the year turns without any prop threading.
 *
 * Rendered only after hydration: it is pure ambience, and keeping it out of
 * the server HTML costs nothing while saving ~22 elements on first paint.
 */
export function SeasonParticles({ index }: { index: number }) {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();
  const season = SEASONS[index];

  if (!hydrated || reduce) return null;

  // Rain is dense and fast; the rest are sparse and slow.
  const count = season.key === "winter" ? PARTICLES.length : 16;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={season.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {PARTICLES.slice(0, count).map((p, i) => (
            <span
              key={i}
              className={`particle particle-${season.key}`}
              style={
                {
                  "--p-left": `${p.left}vw`,
                  "--p-delay": `${p.delaySeconds}s`,
                  "--p-duration": `${p.durationSeconds}s`,
                  "--p-scale": p.scale,
                  "--p-drift": `${p.drift}px`,
                  "--p-opacity": p.opacity,
                } as React.CSSProperties
              }
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
