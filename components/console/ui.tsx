/**
 * The console's shared parts.
 *
 * Same line as the portal's `ui.tsx`: anything on three or more screens lives
 * here. What is NOT here is anything the portal already solved - `Badge`,
 * `ProgressBar`, `ProgressRing`, `EmptyState`, `DefinitionList`, `Panel` and
 * `Avatar` are imported from `components/student-portal/ui.tsx` and
 * re-exported at the bottom, so a console page has one import and the two
 * products cannot drift into two chip designs.
 *
 * The genuinely new object is the TABLE. A register of 1,247 learners is not a
 * list of cards, and the portal never needed one.
 *
 * All server components except `Restricted`, which has to read the viewpoint.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { BODY, CARD, CONSOLE, EYEBROW, HEADING, META } from "@/lib/theme";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/student-portal/icons";
import { AlertIcon, TrendDownIcon, TrendUpIcon } from "@/components/console/icons";
import { formatDelta } from "@/lib/admin";

export {
  Avatar,
  Badge,
  DefinitionList,
  EmptyState,
  Panel,
  ProgressBar,
  ProgressRing,
  StatTile,
  type BadgeTone,
} from "@/components/student-portal/ui";

// The table lives in `console/table.tsx` so the interactive filter can import
// it without dragging this file's data imports into the browser. Re-exported
// here so a server page still has one import.
export {
  Cell,
  EmptyRow,
  NameCell,
  Row,
  TableFoot,
  TableFrame,
  TableHead,
  type Column,
} from "@/components/console/table";

/* -------------------------------------------------------------- page frame */

/** The column every console screen sits in. Wider than the portal's - see
 *  `CONSOLE` in lib/theme.ts for why that is not an arbitrary difference. */
export function PageBody({ children }: { children: ReactNode }) {
  return <div className={`${CONSOLE.container} ${CONSOLE.pageY}`}>{children}</div>;
}

/**
 * The top of every console screen. The portal's `PageHeader` with one
 * addition - `meta`, a row of facts under the title, because an administrator
 * opening a record needs to know its state before they read a word of it.
 *
 * The heading size matches the portal's own `PageHeader` - one step down from
 * `HEADING.section` - for the same reason: this is a screen opened many times
 * a day by both roles, not a page read once. See the note there.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  back,
  meta,
  actions,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  back?: { href: string; label: string };
  /** Chips, dates, ids - anything that qualifies the title. */
  meta?: ReactNode;
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

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className={EYEBROW.onLight}>{eyebrow}</p>
          <h1 className="font-display text-3xl tracking-tight text-balance text-ink sm:text-4xl">
            {title}
          </h1>
          {lead ? <p className={`measure-wide mt-4 ${BODY.base}`}>{lead}</p> : null}
          {meta ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">{meta}</div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}

/** A titled block inside a page. */
export function Section({
  title,
  description,
  action,
  className = "",
  children,
}: {
  title: string;
  description?: string;
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
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------- stats */

/**
 * A headline figure with its movement since last month.
 *
 * The DELTA IS TEXT AS WELL AS COLOUR, and the arrow is only ever beside the
 * words. A green arrow alone tells a colour-blind reader nothing, and on this
 * platform "down" is not automatically bad - fewer suspensions is a good
 * month - which is why `goodWhen` has to be stated rather than assumed.
 */
export function MetricCard({
  label,
  value,
  delta,
  hint,
  goodWhen = "up",
  chart,
}: {
  label: string;
  value: ReactNode;
  /** Percentage change. Omit for a figure with nothing to compare against. */
  delta?: number;
  hint?: string;
  goodWhen?: "up" | "down";
  /** A sparkline, drawn by the caller. */
  chart?: ReactNode;
}) {
  const rising = (delta ?? 0) > 0;
  const good = delta === undefined || delta === 0 ? null : rising === (goodWhen === "up");
  const Icon = rising ? TrendUpIcon : TrendDownIcon;

  return (
    <div className={`${CARD} flex flex-col gap-4 px-6 py-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={META.base}>{label}</p>
          <p className="text-figure mt-2 text-ink">{value}</p>
        </div>
        {chart ? <div className="shrink-0 pt-2">{chart}</div> : null}
      </div>

      {delta !== undefined ? (
        <p className="flex flex-wrap items-center gap-1.5 text-sm">
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              good === null
                ? "text-muted"
                : good
                  ? "text-primary"
                  : "text-clay"
            }`}
          >
            {delta === 0 ? null : <Icon className="size-4" />}
            {formatDelta(delta)}
          </span>
          <span className="text-muted">{hint ?? "on last month"}</span>
        </p>
      ) : hint ? (
        <p className={META.base}>{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * A queue: a count, what it is waiting for, and the way to go and clear it.
 * Amber only when the number is not zero - a permanent amber dot beside "0
 * flagged" teaches people to ignore the colour.
 */
export function QueueCard({
  count,
  label,
  href,
  urgent = false,
}: {
  count: number;
  label: string;
  href: string;
  urgent?: boolean;
}) {
  const lit = count > 0;

  return (
    <Link
      href={href}
      className={`${CARD} group flex items-center gap-4 px-5 py-4 transition-colors duration-300 hover:border-muted-light`}
    >
      <span
        aria-hidden="true"
        className={`grid size-11 shrink-0 place-items-center rounded-full font-display text-lg font-bold tracking-tight ${
          !lit
            ? "bg-surface text-muted"
            : urgent
              ? "bg-clay-pale text-clay"
              : "bg-accent-pale text-accent-strong"
        }`}
      >
        {count}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold leading-snug text-ink">
          {label}
        </span>
        <span className={`${META.base} link-wipe`}>
          {lit ? "Open the queue" : "Nothing waiting"}
        </span>
      </span>
      <ChevronRightIcon className="size-5 shrink-0 text-muted-light transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
    </Link>
  );
}

/* ------------------------------------------------------------------ notices */

/**
 * The line that keeps the prototype honest.
 *
 * Every console screen has controls that would write to a database. They all
 * carry one of these rather than each screen inventing its own wording, and it
 * is deliberately plain - a client walking through a demo should never have to
 * wonder whether they just changed something.
 */
export function PrototypeNote({
  children = "Design prototype - nothing on this screen is saved, sent or changed.",
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p role="note" className={`flex items-start gap-2 ${META.base} ${className}`}>
      <AlertIcon className="mt-0.5 size-4 shrink-0 text-muted-light" />
      <span>{children}</span>
    </p>
  );
}

/** A short warning inside a page - a suspended account, a revoked certificate. */
export function Callout({
  tone = "warn",
  title,
  children,
}: {
  tone?: "warn" | "info" | "done";
  title: string;
  children?: ReactNode;
}) {
  const tones = {
    warn: "border-clay/25 bg-clay-pale",
    info: "border-marine/25 bg-marine-pale",
    done: "border-primary/25 bg-tint-mist",
  } as const;

  return (
    <div className={`rounded-sm border px-5 py-4 ${tones[tone]}`}>
      <p className="text-lg font-semibold text-ink">{title}</p>
      {children ? (
        <div className={`mt-1.5 ${BODY.base}`}>{children}</div>
      ) : null}
    </div>
  );
}
