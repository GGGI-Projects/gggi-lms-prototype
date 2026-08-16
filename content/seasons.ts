/**
 * The seasonal year that drives the header and hero.
 *
 * COLOUR IS NOT HERE. The four palettes live in the `@keyframes year` rule in
 * `app/globals.css`, because CSS is the clock - see docs/seasonal-hero.md. If
 * the palette lived in both places it would drift. This file owns the words.
 *
 * Each season maps to one of the real modules, so the rotation previews the
 * curriculum rather than just decorating. The fifth module (gender-responsive
 * budgeting) has no seasonal slot by design.
 */

export type SeasonKey = "spring" | "summer" | "autumn" | "winter";

export type Season = {
  key: SeasonKey;
  /** Shown on the year ribbon. */
  name: string;
  /** The underlined phrase in the headline. Keep all four 16–18 characters
   *  so the headline never reflows as they swap. */
  phrase: string;
  /** One short line beneath the headline. */
  line: string;
  /** A real number or date. Signals to a ministry audience that this platform
   *  deals in facts, inside the first five seconds. */
  fact: string;
};

export const SEASONS: readonly Season[] = [
  {
    // SEASONS[0] is the canonical phrase: what server HTML and screen readers
    // show, and what the rotation starts on - see the note in
    // `components/sections/hero.tsx`. It goes first on purpose.
    key: "spring",
    name: "Spring",
    phrase: "climate financing",
    line: "New growth - where a bankable case gets built.",
    fact: "Inter-monsoon · March–April",
  },
  {
    key: "summer",
    name: "Summer",
    phrase: "social inclusion",
    line: "Consultation season - when a plan asks who was left out.",
    fact: "Mid-year · June–August",
  },
  {
    key: "autumn",
    name: "Autumn",
    phrase: "adaptation planning",
    line: "Dry season - when a provincial plan gets costed.",
    fact: "Second inter-monsoon · Oct–Nov",
  },
  {
    key: "winter",
    name: "Winter",
    phrase: "climate resilience",
    line: "Monsoon - when resilience is tested, not theorised.",
    fact: "≈1,800 mm rainfall",
  },
] as const;

/** One revolution of the globe = one year = four seasons. */
export const YEAR_MS = 24_000;
export const SEASON_MS = YEAR_MS / SEASONS.length;

/**
 * Particle field, precomputed rather than randomised at render.
 *
 * `Math.random()` here would produce different values on the server and the
 * client and blow up hydration. `Math.sin` is deterministic, so both sides
 * agree while the field still looks scattered.
 */
export const PARTICLES = Array.from({ length: 22 }, (_, i) => {
  const noise = (salt: number) => {
    const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return ((v % 1) + 1) % 1;
  };

  return {
    /** vw from the left edge */
    left: Number((noise(1) * 100).toFixed(2)),
    delaySeconds: Number((noise(2) * 9).toFixed(2)),
    durationSeconds: Number((7 + noise(3) * 9).toFixed(2)),
    /** multiplier on the base particle size */
    scale: Number((0.45 + noise(4) * 0.95).toFixed(2)),
    /** horizontal drift in px across the particle's life */
    drift: Number(((noise(5) - 0.5) * 90).toFixed(1)),
    opacity: Number((0.14 + noise(6) * 0.3).toFixed(2)),
  };
});

export type Particle = (typeof PARTICLES)[number];
