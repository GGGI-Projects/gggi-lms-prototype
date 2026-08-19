/**
 * The library's pieces, shared by both consoles.
 *
 * `/admin/materials` and `/lecturer/materials` are THE SAME SHELF. The whole
 * point of a shared library is that an administrator and a lecturer are
 * looking at one set of files, so they are one set of components too - two
 * implementations would be two libraries within a month, differing first in
 * how they sort and then in what they show.
 *
 * What the two routes decide for themselves is only the frame around this: the
 * page title, which capability the upload form is gated on, and where a
 * material's "used in" links point.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { BODY, CARD, META } from "@/lib/theme";
import type { LibraryEntry } from "@/lib/materials";
import { formatDate } from "@/lib/portal";
import { Badge } from "@/components/console/ui";
import {
  DatasetIcon,
  LinkIcon,
  PdfIcon,
  SheetIcon,
  SlidesIcon,
  VideoIcon,
} from "@/components/student-portal/icons";

/* ------------------------------------------------------------------- kinds */

const KIND_ICON = {
  pdf: PdfIcon,
  slides: SlidesIcon,
  sheet: SheetIcon,
  dataset: DatasetIcon,
  link: LinkIcon,
  video: VideoIcon,
} as const;

export const KIND_LABEL = {
  pdf: "PDF",
  slides: "Slides",
  sheet: "Spreadsheet",
  dataset: "Dataset",
  link: "Link",
  video: "Recording",
} as const;

export type LibraryKindKey = keyof typeof KIND_ICON;

/** The square mark in front of every material, one size everywhere. */
export function KindMark({
  kind,
  className = "size-10",
}: {
  kind: string;
  className?: string;
}) {
  const Icon = KIND_ICON[kind as LibraryKindKey] ?? LinkIcon;

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-sm bg-surface text-ink-soft ${className}`}
    >
      <Icon className="size-5" />
    </span>
  );
}

/* --------------------------------------------------------------- one entry */

/**
 * A material as a row.
 *
 * USAGE IS THE SECOND LINE, always. "Attached to 3 lectures" and "Not attached
 * to anything" are the two facts that decide what happens to a file next, and
 * putting them anywhere but directly under the title means nobody reads them.
 */
export function MaterialRow({
  entry,
  href,
  action,
}: {
  entry: LibraryEntry;
  href: string;
  /** A control on the right - a checkbox in the picker, a link in the list. */
  action?: ReactNode;
}) {
  const { asset, group, usage } = entry;

  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <KindMark kind={asset.kind} />

      <div className="min-w-0 flex-1">
        <Link href={href} className="block">
          <span className="block truncate text-lg font-semibold text-ink">
            <span className="link-wipe">{asset.title}</span>
          </span>
        </Link>

        <p className={`mt-0.5 ${META.base}`}>
          {usage.length
            ? `Attached to ${usage.length} ${usage.length === 1 ? "lecture" : "lectures"}`
            : "Not attached to anything yet"}
          {group ? ` · ${group.name}` : null}
          {asset.size ? ` · ${asset.size}` : null}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {asset.language && asset.language !== "English" ? (
          <Badge tone="info">{asset.language}</Badge>
        ) : null}
        <Badge>{KIND_LABEL[asset.kind as LibraryKindKey] ?? asset.kind}</Badge>
        {action}
      </div>
    </div>
  );
}

/** A shelf, as a card. The count and the newest date are what make it useful. */
export function GroupCard({
  href,
  name,
  description,
  count,
  attached,
  lectures,
  newest,
}: {
  href: string;
  name: string;
  description: string;
  count: number;
  attached: number;
  lectures: number;
  newest?: string;
}) {
  return (
    <Link
      href={href}
      className={`${CARD} group flex flex-col p-6 transition-colors duration-300 hover:border-muted-light`}
    >
      <h3 className="font-display text-xl tracking-tight text-ink">
        <span className="link-wipe">{name}</span>
      </h3>
      <p className={`mt-2 flex-1 ${BODY.base}`}>{description}</p>

      <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-surface-deep pt-4">
        <div>
          <dt className={META.base}>Files</dt>
          <dd className="font-display text-lg font-bold tabular-nums tracking-tight text-ink">
            {count}
          </dd>
        </div>
        <div>
          <dt className={META.base}>In use</dt>
          <dd className="font-display text-lg font-bold tabular-nums tracking-tight text-ink">
            {attached}
          </dd>
        </div>
        <div>
          <dt className={META.base}>Lectures</dt>
          <dd className="font-display text-lg font-bold tabular-nums tracking-tight text-ink">
            {lectures}
          </dd>
        </div>
        {newest ? (
          <div className="ml-auto text-right">
            <dt className={META.base}>Newest</dt>
            <dd className="text-lg text-ink">{formatDate(newest)}</dd>
          </div>
        ) : null}
      </dl>
    </Link>
  );
}

/** Where a material is used, as links into whichever console is asking. */
export function UsageList({
  entry,
  lectureHref,
}: {
  entry: LibraryEntry;
  lectureHref: (moduleId: string, lectureId: string) => string;
}) {
  if (!entry.usage.length) {
    return (
      <p className={BODY.base}>
        Nothing attaches this yet. It is either the next lecture&rsquo;s handout
        or dead weight - the library exists so that difference is visible rather
        than buried in somebody&rsquo;s uploads.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-surface-deep">
      {entry.usage.map((use) => (
        <li key={`${use.moduleId}-${use.lectureId}`} className="py-3 first:pt-0 last:pb-0">
          <Link
            href={lectureHref(use.moduleId, use.lectureId)}
            className="block text-lg font-semibold text-ink"
          >
            <span className="link-wipe">
              {use.lectureNumber}. {use.lectureTitle}
            </span>
          </Link>
          <p className={`mt-0.5 ${META.base}`}>{use.moduleTitle}</p>
        </li>
      ))}
    </ul>
  );
}
