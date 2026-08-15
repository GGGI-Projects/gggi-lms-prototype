"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { CARD, META } from "@/lib/theme";
import { SearchIcon } from "@/components/student-portal/icons";
import { FilterIcon } from "@/components/console/icons";
import { KindMark, KIND_LABEL, type LibraryKindKey } from "@/components/console/material-parts";
import { Badge } from "@/components/student-portal/ui";
import type { ConsoleArea } from "@/components/console/nav";

/**
 * The whole shelf, searchable.
 *
 * Rows are built here rather than server-rendered and passed in, unlike the
 * registers - because a material row is four fields and a link, and passing
 * thirty finished `ReactNode`s to filter client-side would send more markup
 * than the data it was made from. The rule the console follows is: hand the
 * server's rendering across when a row is a join (a learner's programmes, an
 * instructor's workload), build it here when a row is a record.
 *
 * FILTERS BY GROUP AND BY KIND, because those are the two questions asked of a
 * library: "where is the waste stuff" and "is there a spreadsheet for this".
 */

export type ShelfEntry = {
  id: string;
  title: string;
  description: string;
  kind: string;
  size?: string;
  groupId: string;
  groupName: string;
  uploadedBy: string;
  uploadedOn: string;
  uses: number;
  language?: string;
};

export function MaterialShelf({
  area,
  entries,
  groups,
  action,
}: {
  area: ConsoleArea;
  entries: ShelfEntry[];
  groups: { id: string; name: string; count: number }[];
  /** The thing that adds to this shelf - "New material". Pinned to the right
   *  end of the search row, where the list starts. */
  action?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [kind, setKind] = useState("all");
  const [unusedOnly, setUnusedOnly] = useState(false);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matches =
        !needle ||
        `${entry.title} ${entry.groupName} ${entry.uploadedBy} ${entry.description}`
          .toLowerCase()
          .includes(needle);
      return (
        matches &&
        (group === "all" || entry.groupId === group) &&
        (kind === "all" || entry.kind === kind) &&
        (!unusedOnly || entry.uses === 0)
      );
    });
  }, [entries, query, group, kind, unusedOnly]);

  const kinds = [...new Set(entries.map((entry) => entry.kind))];

  return (
    <div>
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Search the library</span>
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-light" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, group or who uploaded it"
              className="field py-2.5 pl-12"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <FilterIcon className="size-4 shrink-0 text-muted-light" />

            <label className="block">
              <span className="sr-only">Group</span>
              <select
                value={group}
                onChange={(event) => setGroup(event.target.value)}
                className="field w-auto py-2"
              >
                <option value="all">Every group</option>
                {groups.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name} ({entry.count})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="sr-only">File type</span>
              <select
                value={kind}
                onChange={(event) => setKind(event.target.value)}
                className="field w-auto py-2"
              >
                <option value="all">Any type</option>
                {kinds.map((entry) => (
                  <option key={entry} value={entry}>
                    {KIND_LABEL[entry as LibraryKindKey] ?? entry}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => setUnusedOnly((current) => !current)}
              aria-pressed={unusedOnly}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-300 ${
                unusedOnly
                  ? "border-primary bg-primary text-paper"
                  : "border-surface-deep bg-paper text-ink-soft hover:border-muted-light hover:text-ink"
              }`}
            >
              Never used
            </button>
          </div>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <ul className="divide-y divide-surface-deep">
          {shown.length ? (
            shown.map((entry) => (
              <li key={entry.id} className="flex items-start gap-4 px-5 py-4">
                <KindMark kind={entry.kind} />

                <div className="min-w-0 flex-1">
                  <Link href={`/${area}/materials/${entry.id}`} className="block">
                    <span className="block truncate text-lg font-semibold text-ink">
                      <span className="link-wipe">{entry.title}</span>
                    </span>
                  </Link>
                  <p className={`mt-0.5 truncate ${META.base}`}>
                    {entry.description}
                  </p>
                  <p className={`mt-1.5 ${META.base}`}>
                    {entry.groupName}
                    {entry.size ? ` · ${entry.size}` : null} ·{" "}
                    {entry.uploadedBy} · {entry.uploadedOn}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge tone={entry.uses ? "done" : "warn"}>
                    {entry.uses
                      ? `${entry.uses} ${entry.uses === 1 ? "module" : "modules"}`
                      : "Never used"}
                  </Badge>
                  {entry.language && entry.language !== "English" ? (
                    <Badge tone="info">{entry.language}</Badge>
                  ) : null}
                </div>
              </li>
            ))
          ) : (
            <li className="px-5 py-14 text-center text-lg text-muted">
              Nothing on the shelf matches that.
            </li>
          )}
        </ul>
      </div>

      <p className={`mt-4 ${META.base}`}>
        {shown.length} of {entries.length} files shown
      </p>
    </div>
  );
}
