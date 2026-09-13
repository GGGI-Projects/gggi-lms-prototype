"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CARD, META } from "@/lib/theme";
import { SearchIcon } from "@/components/student-portal/icons";
import { FilterIcon } from "@/components/console/icons";
import { Badge } from "@/components/student-portal/ui";

/**
 * The Tool directory's own list, searchable - same shape as `<LawShelf>`
 * (see the note there). No scope column, since a Tool has none.
 */

export type ToolShelfEntry = {
  id: string;
  title: string;
  explanation: string;
  link: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  moduleCount: number;
};

const STATUS_LABEL: Record<ToolShelfEntry["status"], string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

export function ToolShelf({ entries }: { entries: ToolShelfEntry[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [tag, setTag] = useState("all");
  const [unrelatedOnly, setUnrelatedOnly] = useState(false);

  const tags = useMemo(
    () => [...new Set(entries.flatMap((entry) => entry.tags))].sort(),
    [entries],
  );

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matches =
        !needle ||
        `${entry.title} ${entry.explanation}`.toLowerCase().includes(needle);
      return (
        matches &&
        (status === "all" || entry.status === status) &&
        (tag === "all" || entry.tags.includes(tag)) &&
        (!unrelatedOnly || entry.moduleCount === 0)
      );
    });
  }, [entries, query, status, tag, unrelatedOnly]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="relative block w-full lg:max-w-sm">
          <span className="sr-only">Search tools</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-light" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title or explanation"
            className="field py-2.5 pl-12"
          />
        </label>

        <FilterIcon className="size-4 shrink-0 text-muted-light" />

        <label className="block w-full sm:w-auto sm:max-w-xs">
          <span className="sr-only">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="field py-2.5"
          >
            <option value="all">Any status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="block w-full sm:w-auto sm:max-w-xs">
          <span className="sr-only">Tag</span>
          <select
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            className="field py-2.5"
          >
            <option value="all">Any tag</option>
            {tags.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setUnrelatedOnly((current) => !current)}
          aria-pressed={unrelatedOnly}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-300 ${
            unrelatedOnly
              ? "border-primary bg-primary text-paper"
              : "border-surface-deep bg-paper text-ink-soft hover:border-muted-light hover:text-ink"
          }`}
        >
          Not on any module
        </button>
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <ul className="divide-y divide-surface-deep">
          {shown.length ? (
            shown.map((entry) => (
              <li key={entry.id} className="px-5 py-4">
                <Link href={`/tools-admin/${entry.id}`} className="block">
                  <span className="block truncate text-lg font-semibold text-ink">
                    <span className="link-wipe">{entry.title}</span>
                  </span>
                </Link>
                <p className={`mt-0.5 truncate ${META.base}`}>
                  {entry.explanation}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge
                    tone={
                      entry.status === "published"
                        ? "done"
                        : entry.status === "draft"
                          ? "neutral"
                          : "warn"
                    }
                  >
                    {STATUS_LABEL[entry.status]}
                  </Badge>
                  <Badge tone={entry.moduleCount ? "info" : "warn"}>
                    {entry.moduleCount
                      ? `${entry.moduleCount} ${entry.moduleCount === 1 ? "module" : "modules"}`
                      : "No module yet"}
                  </Badge>
                  {entry.tags.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-surface-deep bg-paper px-2 py-0.5 text-xs text-muted"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </li>
            ))
          ) : (
            <li className="px-5 py-14 text-center text-lg text-muted">
              No tool matches that.
            </li>
          )}
        </ul>
      </div>

      <p className={`mt-4 ${META.base}`}>
        {shown.length} of {entries.length} tools shown
      </p>
    </div>
  );
}
