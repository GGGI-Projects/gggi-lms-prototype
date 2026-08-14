import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { TOTALS } from "@/content/site";
import { LeafMark, RibbonScene } from "@/components/art/scenes";
import { EYEBROW } from "@/lib/theme";

/**
 * The dark half of the account pages.
 *
 * It carries the argument the landing page spends nine sections making, in the
 * shortest form it survives in: what it costs, what it asks of you, and what
 * you leave with. Someone who arrives here from a shared link has not read any
 * of that, and a bare form on a white page gives them no reason to fill it in.
 *
 * Deliberately NOT seasonal. `.season-clock` re-resolves computed style for its
 * whole subtree on every frame, and it exists to make the hero's globe read as
 * a moment in the year - there is no globe here, so the animation would cost
 * the same and buy a panel that quietly changes colour behind a form. It uses
 * the page palette instead, like every section below the hero.
 *
 * A plain server component: no JS is shipped for any of it.
 */
export function AuthAside({
  mode,
  className = "",
}: {
  mode: AuthMode;
  className?: string;
}) {
  const copy = COPY[mode];

  return (
    // `h-svh` and `sticky` from `lg` up only: on a phone this is a band the
    // visitor scrolls past on the way to the form, and a full-height panel
    // there would be a screen of preamble in front of the thing they came for.
    // The two blocks that are least load-bearing are dropped below `lg` for the
    // same reason - see the classes on the paragraph and the stat row.
    <aside
      className={`relative isolate flex flex-col overflow-hidden bg-primary-950 px-8 py-10 text-tint sm:px-12 lg:sticky lg:top-0 lg:h-svh lg:justify-between lg:py-14 xl:px-16 ${className}`}
    >
      {/* Same ambient bloom as the closing CTA, so the two dark grounds on the
          site read as the same material. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-52 left-1/4 -z-10 size-[36rem] rounded-full bg-primary-600/25 blur-[120px]"
      />

      <Link
        href="/"
        className="group inline-flex items-center gap-2.5 self-start"
        aria-label={`${BRAND.name} ${BRAND.suffix} - home`}
      >
        <span className="grid size-9 place-items-center rounded-full bg-accent text-primary-950 transition-transform duration-500 ease-out-expo group-hover:-rotate-12">
          <LeafMark className="size-5" />
        </span>
        <span className="font-display text-lg leading-none tracking-tight text-paper">
          {BRAND.name}
          {BRAND.suffix ? (
            <span className="text-primary-500"> {BRAND.suffix}</span>
          ) : null}
        </span>
      </Link>

      <div className="mt-10 lg:mt-0">
        <p className={EYEBROW.onDark}>{copy.eyebrow}</p>
        {/* The Title step rather than a display heading. The page's real
            heading is the one above the form, on the other side of the fold -
            two display headlines side by side would leave a visitor unsure
            which of the two things on screen they are meant to be doing. */}
        <h2 className="font-display mt-5 text-2xl leading-snug tracking-tight text-paper text-balance sm:text-3xl">
          {copy.heading}
        </h2>
        <p className="measure mt-5 hidden text-lg leading-relaxed lg:block">
          {copy.body}
        </p>

        <ul className="mt-9 space-y-4">
          {copy.promises.map((promise) => (
            <li key={promise} className="flex items-start gap-3.5 text-lg leading-relaxed">
              <span className="mt-1.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-primary-950">
                <CheckIcon className="size-3" />
              </span>
              {promise}
            </li>
          ))}
        </ul>
      </div>

      <dl className="mt-12 hidden max-w-md grid-cols-3 gap-x-6 border-t border-primary-800 pt-8 lg:mt-0 lg:grid">
        <Stat value={TOTALS.programmes} label="Programmes" />
        <Stat value={TOTALS.modules} label="Modules" />
        <Stat value={TOTALS.hours} label="Hours of material" />
      </dl>

      {/* The landscape strip that closes the landing page, reused as the base
          of this panel. Sits behind everything and is cropped by the column. */}
      <RibbonScene className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 w-full opacity-60" />
    </aside>
  );
}

/**
 * The two pages this panel serves.
 *
 * Both sets of copy live here rather than being passed in from the routes,
 * because the panel is the only place either is used and the pair has to be
 * READ TOGETHER: sign-up argues that the account costs nothing, sign-in argues
 * that the account already holds something. Split across two route files, they
 * drift into being the same four sentences twice.
 */
export type AuthMode = "signup" | "login";

const COPY = {
  signup: {
    eyebrow: "Create your account",
    heading: "An account is only how your progress gets saved.",
    body: `Nothing on ${BRAND.name} sits behind it. There is no paid tier, no approval queue and no departmental sponsorship - you enrol, and you start.`,
    promises: [
      "Free at every stage - no card, ever",
      "No prior qualification required",
      "A checkable certificate for each programme you finish",
      "Self-paced, and your place is held if you stop",
    ],
  },
  login: {
    eyebrow: "Welcome back",
    heading: "Everything is exactly where you left it.",
    body: `Your enrolments, your progress and every certificate you have earned are held against your account - on whatever device you sign in from.`,
    promises: [
      "Picks up at the module you stopped on",
      "Certificates stored, and downloadable again any time",
      "Enrol in another programme whenever you like",
      "Still free - nothing has been added behind a paywall",
    ],
  },
} as const satisfies Record<AuthMode, unknown>;

function Stat({ value, label }: { value: number; label: string }) {
  return (
    // `flex-col-reverse`, so the term can precede its description in the markup
    // - which is the order a description list requires - while the number still
    // reads above the label it is counting.
    <div className="flex flex-col-reverse">
      <dt className="mt-2 text-sm leading-snug text-primary-500">{label}</dt>
      {/* `.text-figure` - the page's one size for a number set as a graphic.
          Used alone; the class sets its own family and tracking. */}
      <dd className="text-figure text-paper">{value}</dd>
    </div>
  );
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
