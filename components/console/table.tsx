/**
 * The register: table markup, and nothing else.
 *
 * Its own file, deliberately, and it imports NO DATA. `components/console/ui.tsx`
 * pulls in `lib/admin`, which pulls in the whole curriculum and every register
 * in the prototype; a client component that imported the table from there
 * would drag all of that into the browser bundle to draw eight rows. Here the
 * only imports are React, `next/link` and the type scale, so the interactive
 * filter can import these and cost nothing.
 *
 * A REAL `<table>`, not a grid of divs. Column headers a screen reader
 * announces with each cell are the difference between a register someone can
 * work through and four hundred unlabelled numbers, and `role="row"` on a div
 * reimplements that badly and only once somebody remembers to.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { CARD, META } from "@/lib/theme";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/student-portal/icons";
import { InitialsAvatar } from "@/components/student-portal/ui";

export type Column = {
  key: string;
  head: ReactNode;
  /** Right-aligns a numeric column. Text stays left, always. */
  numeric?: boolean;
  /** Drops the column below this breakpoint rather than squeezing it. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
};

const HIDE = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
} as const;

/**
 * The head row on its own, so an interactive table can hand the same markup to
 * a `<table>` it builds itself. Two definitions of the header is how one of
 * them ends up a column short.
 */
export function TableHead({ columns }: { columns: Column[] }) {
  return (
    <thead>
      <tr className="border-b border-surface-deep bg-surface/60">
        {columns.map((column) => (
          <th
            key={column.key}
            scope="col"
            className={`whitespace-nowrap px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-muted ${
              column.numeric ? "text-right" : ""
            } ${column.hideBelow ? HIDE[column.hideBelow] : ""}`}
          >
            {column.head}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/** The frame: the card, the horizontal scroll box, the table element. */
export function TableFrame({
  columns,
  caption,
  children,
}: {
  columns: Column[];
  /** Always present, usually visually hidden. A table with no caption is one a
   *  screen reader user meets with no idea what it lists. */
  caption: string;
  children: ReactNode;
}) {
  return (
    <div className={`${CARD} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <TableHead columns={columns} />
          <tbody className="divide-y divide-surface-deep">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function Row({
  href,
  children,
}: {
  /** Only affects the hover treatment - the link itself is in `NameCell`. */
  href?: string;
  children: ReactNode;
}) {
  return (
    <tr className={`transition-colors duration-200 ${href ? "hover:bg-surface/70" : ""}`}>
      {children}
    </tr>
  );
}

export function Cell({
  numeric,
  hideBelow,
  className = "",
  children,
}: {
  numeric?: boolean;
  hideBelow?: Column["hideBelow"];
  className?: string;
  children: ReactNode;
}) {
  return (
    <td
      className={`px-5 py-4 align-middle text-lg text-ink-soft ${
        numeric ? "text-right tabular-nums" : ""
      } ${hideBelow ? HIDE[hideBelow] : ""} ${className}`}
    >
      {children}
    </td>
  );
}

/**
 * The first cell of a row: who or what it is, and the way into it.
 *
 * One component because every register in the console has this column, and
 * each one written by hand grows its own avatar size within a week.
 */
export function NameCell({
  href,
  initials,
  title,
  subtitle,
}: {
  href: string;
  /** Omit for rows that are not people - a programme, a certificate. */
  initials?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <td className="px-5 py-4">
      <Link href={href} className="group flex items-center gap-3">
        {initials ? (
          <InitialsAvatar initials={initials} tone="light" className="size-10" />
        ) : null}
        <span className="min-w-0">
          <span className="block truncate text-lg font-semibold text-ink">
            <span className="link-wipe">{title}</span>
          </span>
          {subtitle ? (
            <span className={`block truncate ${META.base}`}>{subtitle}</span>
          ) : null}
        </span>
      </Link>
    </td>
  );
}

/** A row that says the filter matched nothing, spanning the whole table. */
export function EmptyRow({
  columns,
  children,
}: {
  columns: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={columns} className="px-5 py-14 text-center text-lg text-muted">
        {children}
      </td>
    </tr>
  );
}

/**
 * What sits under a table showing part of a register.
 *
 * The prototype ships one page and says so rather than drawing page numbers
 * that do not turn. Pagination that does nothing is the fastest way to lose a
 * client's trust in everything else on the screen.
 */
export function TableFoot({
  showing,
  total,
  note,
}: {
  showing: number;
  total: number;
  note?: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className={META.base}>
        Showing <span className="font-semibold text-ink">{showing}</span> of{" "}
        <span className="font-semibold text-ink">
          {total.toLocaleString("en-GB")}
        </span>
        {note ? ` · ${note}` : null}
      </p>
      <div aria-hidden="true" className="flex items-center gap-1.5 text-muted-light">
        <span className="grid size-9 place-items-center rounded-sm border border-surface-deep">
          <ChevronLeftIcon className="size-4" />
        </span>
        <span className="grid size-9 place-items-center rounded-sm border border-surface-deep">
          <ChevronRightIcon className="size-4" />
        </span>
      </div>
    </div>
  );
}
