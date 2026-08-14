/**
 * Shared class recipes.
 *
 * WHAT BELONGS HERE: combinations of utilities that more than one section
 * repeats - the section rhythm, the container, the eyebrow, the section
 * heading, the standard body sizes. Change one of these and every section
 * that uses it moves together.
 *
 * WHAT DOES NOT BELONG HERE: colour values, spacing scales, radii, fonts.
 * Those live in the `@theme` block in `app/globals.css` and are the single
 * source of truth for the design system. A hex code in this file would be a
 * second definition of the same colour, and the two would drift the first
 * time someone changed only one of them - the same reason the seasonal
 * palette lives in CSS and `content/seasons.ts` holds only the words.
 *
 * So: this file names *patterns*, `globals.css` owns *values*.
 *
 * One constraint to respect when editing: every recipe must be a complete
 * literal string. Tailwind finds classes by scanning source text, so it can
 * see `"py-24 sm:py-32"` here, but it cannot see `` `py-${n}` `` - a
 * constructed class name compiles fine and then silently renders unstyled.
 */

/* ------------------------------------------------------------------ layout */

/**
 * Vertical rhythm between sections. Every full section on the page uses
 * `SECTION.y`; the number appears once so the whole page can breathe more or
 * less from a single edit.
 */
export const SECTION = {
  y: "py-24 sm:py-32",
} as const;

/** The editorial column. Header and hero deliberately opt out - they are
 *  full-bleed and use `px-fluid` instead. */
export const CONTAINER = "mx-auto max-w-editorial px-5 sm:px-8";

/** The gutter on its own, for sections that manage their own max width. */
export const GUTTER = "px-5 sm:px-8";

/**
 * The signed-in pages.
 *
 * A portal is not a landing page and the rhythm has to say so. `SECTION.y` is
 * 96-128px of air between sections, which is right for a page being read once
 * on the way to a decision and wrong for a page someone opens every day to
 * find where they stopped - there, whitespace that size means scrolling past
 * the thing you came for.
 *
 * `container` is the same editorial column the landing page uses, so the
 * content still lines up with the site it belongs to; only the vertical
 * measure changes. `stack` is the gap between blocks WITHIN a portal page,
 * named once for the same reason `SECTION.y` is.
 */
export const PORTAL = {
  container: "mx-auto w-full max-w-editorial px-5 sm:px-8",
  pageY: "py-10 sm:py-14",
  stack: "mt-12 sm:mt-14",
} as const;

/* -------------------------------------------------------------- typography */

/**
 * Small caps label above a section heading.
 *
 * `onDark` is amber rather than teal because teal has nowhere near the
 * contrast it needs on `primary-950`.
 */
export const EYEBROW = {
  onLight: "label-eyebrow text-primary",
  onDark: "label-eyebrow text-accent-soft",
  muted: "label-eyebrow text-muted",
  /** For the two sections that are pitched bronze rather than teal - the
   *  programmes list and the certificate. `accent` itself is too light to sit
   *  as 11px text on paper, so this is the darker `accent-strong`. */
  accent: "label-eyebrow text-accent-strong",
} as const;

/**
 * Section headings.
 *
 * The top margin is part of the recipe on purpose. Every one of these follows
 * an eyebrow, and before this file existed the gap between them was mt-4 in
 * one section, mt-5 in four and mt-6 in two - drift nobody chose, introduced
 * one section at a time. Baking in mt-5 means it cannot happen again.
 */
export const HEADING = {
  /**
   * Display, hero only.
   *
   * The mission section used to borrow this, which made one section below the
   * fold shout at the same volume as the page title. It is now the hero's
   * alone. Colour is left to the caller because the hero sets its own from the
   * seasonal clock.
   */
  page: "font-display text-display-xl mt-5 text-balance",
  /** Display. EVERY section heading below the hero, light ground... */
  section: "font-display text-display-lg mt-5 text-balance text-ink",
  /** ...and dark. */
  sectionOnDark: "font-display text-display-lg mt-5 text-balance text-paper",
  /**
   * Title. Every h3 on the page: card titles, programme rows, FAQ questions,
   * journey step titles.
   *
   * `sub`, `subOnDark` and `row` used to sit between this and `section` at
   * 26.4-38.4px and 24-28px. Three steps for one job - "a heading inside a
   * section" - so all of them land here. What separates a step title from the
   * copy under it is now Hanken against Source Sans, not two point sizes.
   */
  card: "font-display text-2xl tracking-tight text-ink",
  cardOnDark: "font-display text-2xl tracking-tight text-paper",
} as const;

/**
 * Body copy. One size - 18px, the Body step - on every ground.
 *
 * There were three sizes here (21 / 18 / 16) and they encoded EMPHASIS, not
 * three kinds of prose: an opening paragraph, ordinary prose, and copy inside
 * a card. Emphasis is now carried by colour alone, which is what `lead` is -
 * the same 18px at full-strength ink instead of ink-soft. That reads as
 * emphasis at any size and does not need a second measurement to work.
 *
 * On why 18 and not 17: Source Sans 3 is a text face and its x-height is about
 * 11% shorter than Inter's - 0.486em against 0.546 - so the same point size
 * renders visibly smaller. The number follows the face; the intended READING
 * size is what is being held constant.
 *
 * The `OnDark` and `OnMarine` variants exist rather than being written as
 * `${BODY.base} text-marine-pale` at the call site: both halves would be
 * `text-*` utilities, and which one wins is decided by their order in the
 * compiled stylesheet, not by the order they appear in the class attribute. A
 * separate recipe cannot lose that race.
 */
export const BODY = {
  lead: "text-lg leading-relaxed text-ink",
  base: "text-lg leading-relaxed text-ink-soft",
  leadOnDark: "text-lg leading-relaxed text-paper",
  onDark: "text-lg leading-relaxed text-tint",
  leadOnMarine: "text-lg leading-relaxed text-paper",
  onMarine: "text-lg leading-relaxed text-marine-pale",
} as const;

/**
 * Labels, counts and captions - the Small step.
 *
 * Same size as `EYEBROW`, deliberately: they are the same tier of information
 * and only differ in treatment (an eyebrow is uppercase and tracked out, a
 * caption is not). This is a role, not a size.
 */
export const META = {
  base: "text-sm text-muted",
  onDark: "text-sm text-tint",
} as const;

/* ------------------------------------------------------------------ surface */

/**
 * The raised panel. Kept at `rounded-sm` deliberately: the theme's
 * `rounded-lg` is 22px, and at that radius on a small block the corner
 * becomes the loudest thing in the composition.
 */
export const CARD = "rounded-sm border border-surface-deep bg-paper-raised";

/**
 * One hue per card, from the subject-hue family - the same five the marquee
 * puts on screen.
 *
 * Used by BOTH three-card rows on the page (the mission's principles and the
 * audience groups), which is why it lives here rather than in either of them:
 * two copies of this array would let the two rows drift onto different hues,
 * or into the same hues in a different order, and the sections sit close
 * enough that either would read as a mistake.
 *
 * The hue is confined to the numeral and the bullet dots. Ground, border,
 * heading and body copy are untouched, so this is a few dozen coloured pixels
 * per card and not three coloured cards.
 *
 * Ordered cool → warm → cool rather than in the palette's own order, so no two
 * adjacent cards share a temperature.
 *
 * Class names, not hex - `globals.css` still owns the values.
 */
export const CARD_TONES = [
  { text: "text-marine", dot: "bg-marine" },
  { text: "text-clay", dot: "bg-clay" },
  { text: "text-plum", dot: "bg-plum" },
] as const;
