/**
 * The portal's shared parts.
 *
 * The line this file draws: anything that appears on THREE OR MORE portal
 * screens lives here. A progress bar is on the dashboard, the catalogue, the
 * module page and the certificate; a page heading is on all ten. Written at
 * each call site, those drift into four bar heights and three heading
 * treatments, and the portal stops looking like one product.
 *
 * All server components - none of these needs state, so none of them ships
 * JavaScript. The two client components in the portal are the shell (which has
 * to know the route) and the quiz (which has to be answered).
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { BODY, CARD, EYEBROW, HEADING, META, PORTAL } from "@/lib/theme";
import { ChevronLeftIcon } from "@/components/student-portal/icons";

/* -------------------------------------------------------------- page frame */

/**
 * The top of every portal screen.
 *
 * The heading is ONE STEP DOWN FROM `HEADING.section` on purpose - big enough
 * to read as a page's own title against the eyebrow above it, small enough
 * not to out-shout everything under it on a page a learner opens ten times a
 * week. `HEADING.section` stays the account pages' size ("Pick up where you
 * left off" and the like) and the marketing site's section headings, both of
 * which are read once per visit rather than every day.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  back,
  actions,
}: {
  eyebrow: string;
  /** A plain string on every screen but the lecture page, which appends a
   *  completed-state icon beside it - see the note there. */
  title: ReactNode;
  lead?: string;
  /** A way back up the tree, above the eyebrow. Only on nested screens. */
  back?: { href: string; label: string };
  /** Buttons, right-aligned from `sm` up and stacked under the copy below it. */
  actions?: ReactNode;
}) {
  return (
    <header>
      {back ? (
        <Link
          href={back.href}
          className="group -ml-1 mb-6 inline-flex items-center gap-1.5 text-lg font-semibold text-primary"
        >
          <ChevronLeftIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" />
          <span className="link-wipe">{back.label}</span>
        </Link>
      ) : null}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className={EYEBROW.onLight}>{eyebrow}</p>
          <h1 className="font-display text-3xl tracking-tight text-balance text-ink sm:text-4xl">
            {title}
          </h1>
          {lead ? <p className={`measure-wide mt-5 ${BODY.base}`}>{lead}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}

/** The column every portal page's content sits in. */
export function PageBody({ children }: { children: ReactNode }) {
  return <div className={`${PORTAL.container} ${PORTAL.pageY}`}>{children}</div>;
}

/**
 * A titled block inside a page - "Your modules", "Recent activity".
 *
 * Title step, not Display: the page already has one Display heading and a
 * second would leave the reader unsure which of the two is the page.
 */
export function Section({
  title,
  description,
  action,
  className = "",
  children,
}: {
  title: string;
  description?: string;
  /** Usually a "See all" link. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className={HEADING.card}>{title}</h2>
          {description ? (
            <p className={`measure-wide mt-2 ${BODY.base}`}>{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** The raised surface. `CARD` plus the padding, which was drifting per screen. */
export function Panel({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`${CARD} p-6 sm:p-8 ${className}`}>{children}</div>;
}

/* ------------------------------------------------------------------ avatar */

const AVATAR_TONE = {
  /** On the dark rail and the header: amber on ink. */
  dark: "bg-accent leading-none text-primary-950",
  /** On a light table row: a quiet tint, sized for a name cell. */
  light: "bg-tint-mist text-sm text-primary",
} as const;

/**
 * Someone's avatar - the rail, the topbar and every register's first column
 * all want the same circle and were building it three separate times before
 * this existed.
 *
 * A REAL PHOTO WHEN THERE IS ONE, which is every staff and student record in
 * this prototype - see the `avatarUrl` field on `StaffMember`
 * (`content/staff.ts`), `StudentRecord` (`content/students.ts`) and
 * `LEARNER` (`content/portal.ts`). They are sourced from Unsplash: free to
 * use for this kind of thing under Unsplash's license, and picked as plain,
 * anonymous headshots rather than attached to any claim about who they
 * really are - a real build would swap these for the person's own uploaded
 * photo. `src` is the browser's own `<img>`, not `next/image`: these are
 * small, decorative and already sized by Unsplash's own URL parameters, so
 * there is nothing next/image's optimiser would do for them that is worth
 * the extra remote-pattern config - see `next.config.ts` for the matching
 * `img-src` entry a strict CSP needs before a browser will load them at all.
 *
 * FALLS BACK TO INITIALS when `src` is absent, which no real person record
 * here leaves it as, but keeps this safe for anything that is not one.
 * `tone` only matters for that fallback - the one thing that actually
 * differs between a dark rail and a light table row; size and text scale
 * still come from `className`, the same as before.
 */
export function Avatar({
  src,
  initials,
  tone = "dark",
  className = "",
}: {
  src?: string;
  initials: string;
  tone?: keyof typeof AVATAR_TONE;
  className?: string;
}) {
  if (src) {
    // Plain `<img>`, deliberately not `next/image` - see the note above. This
    // is the one, well-understood exception to the framework's default.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-display font-bold tracking-tight ${AVATAR_TONE[tone]} ${className}`}
    >
      {initials}
    </span>
  );
}

/* ---------------------------------------------------------------- progress */

/**
 * The progress bar.
 *
 * Amber fill on a neutral track, which is the palette's own rule rather than a
 * choice made here: `accent` is for graphics - seals, bullets, progress bars -
 * and never for text. It also means a bar at 100% and a bar at 12% are the
 * same colour, so the length is doing all the work. Colour-coding completion
 * would be a second signal saying what the number already says, and it would
 * exclude anyone who cannot separate the two hues.
 */
export function ProgressBar({
  percent,
  label,
  className = "",
}: {
  percent: number;
  /** Announced to screen readers. The bar itself is never the only signal. */
  label: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-1.5 w-full overflow-hidden rounded-full bg-surface-deep ${className}`}
    >
      {/* Width as an inline style, not a class: Tailwind cannot see a
          constructed class name, so `w-[${percent}%]` compiles and renders
          unstyled. This is a value, not a token. */}
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/**
 * The same quantity as a ring, for the places a bar cannot go - inside a card
 * header, beside a title. Drawn with two circles and a dash offset; no JS, and
 * it is correct in the server HTML.
 */
export function ProgressRing({
  percent,
  label,
  size = 56,
  className = "",
}: {
  percent: number;
  label: string;
  size?: number;
  className?: string;
}) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" className="size-full -rotate-90" aria-hidden="true">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="var(--color-surface-deep)"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-sm font-bold tracking-tight text-ink">
        {percent}%
      </span>
      <span className="sr-only">
        {label}: {percent}% complete
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------- stats */

/**
 * A number set as a graphic with a label under it.
 *
 * `.text-figure` is the page's single size for this - the hero's totals and
 * the account panel's stats already use it, and the dashboard's row is the
 * same object in a third place.
 */
export function StatTile({
  value,
  label,
  hint,
}: {
  value: ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <div className={`${CARD} px-6 py-6`}>
      <p className="text-figure text-ink">{value}</p>
      <p className="mt-2 text-lg font-semibold leading-snug text-ink">{label}</p>
      {hint ? <p className={`mt-1 ${META.base}`}>{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ badges */

/**
 * The one chip in the portal.
 *
 * Five tones, and each is a ROLE rather than a colour: `neutral` for facts
 * about a thing (level, duration), `done` for finished, `active` for in
 * progress, `warn` for something outstanding, `accent` for a credential. Call
 * sites ask for the role, so re-pitching "outstanding" from clay to bronze is
 * one edit here.
 */
const BADGE_TONES = {
  neutral: "border-surface-deep bg-paper text-muted",
  done: "border-primary/25 bg-tint-mist text-primary",
  active: "border-accent-600/35 bg-accent-pale text-accent-strong",
  warn: "border-clay/25 bg-clay-pale text-clay",
  info: "border-marine/25 bg-marine-pale text-marine",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({
  tone = "neutral",
  icon,
  children,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-sm font-medium ${BADGE_TONES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------- empty */

/**
 * What a screen says when it has nothing on it.
 *
 * Every list in the portal can legitimately be empty - a new account has no
 * certificates, no quizzes and no activity - and a blank area reads as a
 * failure to load. It always carries a way out, because the only useful thing
 * an empty screen can do is point at the action that fills it.
 */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-sm border border-dashed border-muted-light bg-paper-raised px-8 py-14 text-center">
      <h3 className={HEADING.card}>{title}</h3>
      <p className={`measure mx-auto mt-3 ${BODY.base}`}>{body}</p>
      {action ? <div className="mt-7 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------- definitions */

/**
 * A label-and-value pair, used by the module facts panel, the profile and
 * the certificate. A real `<dl>`, so the pairing survives without the layout.
 */
export function DefinitionList({
  items,
  className = "",
}: {
  items: { term: string; value: ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={`divide-y divide-surface-deep ${className}`}>
      {items.map((item) => (
        <div
          key={item.term}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5 first:pt-0 last:pb-0"
        >
          <dt className={META.base}>{item.term}</dt>
          <dd className="text-lg font-medium text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
