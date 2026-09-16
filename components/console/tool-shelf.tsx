"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterIcon, LinkIcon, ToolIcon } from "@/components/student-portal/icons";
import { TagBadges } from "@/components/student-portal/reference-row";
import { Badge, EmptyState, FIELD_TONE, SearchField } from "@/components/student-portal/ui";
import { CATEGORIES, HAZARDS } from "@/content/tags";
import { BODY, CARD, HEADING, META } from "@/lib/theme";

/**
 * The Tool directory's own list, as a filter rail + card grid - same
 * structure as `<LawShelf>` (see the note there for why this mirrors the
 * learner-facing `<ToolExplorer>`), and no scope filter, the same reason a
 * Tool carries no province (FR-STU-630).
 */

export type ToolShelfEntry = {
  id: string;
  title: string;
  explanation: string;
  link: string;
  status: "draft" | "published" | "archived";
  hazardIds: string[];
  categoryIds: string[];
  moduleCount: number;
};

const STATUSES: ToolShelfEntry["status"][] = ["published", "draft", "archived"];

const STATUS_LABEL: Record<ToolShelfEntry["status"], string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

const STATUS_TONE: Record<ToolShelfEntry["status"], "done" | "neutral" | "warn"> = {
  published: "done",
  draft: "neutral",
  archived: "warn",
};

export function ToolShelf({ entries }: { entries: ToolShelfEntry[] }) {
  const [query, setQuery] = useState("");
  const [hazardId, setHazardId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [statuses, setStatuses] = useState<Record<ToolShelfEntry["status"], boolean>>({
    published: true,
    draft: true,
    archived: true,
  });
  const [unrelatedOnly, setUnrelatedOnly] = useState(false);

  const q = query.trim().toLowerCase();
  const matches = (entry: ToolShelfEntry) =>
    (!q || `${entry.title} ${entry.explanation}`.toLowerCase().includes(q)) &&
    (hazardId === "all" || entry.hazardIds.includes(hazardId)) &&
    (categoryId === "all" || entry.categoryIds.includes(categoryId)) &&
    statuses[entry.status] &&
    (!unrelatedOnly || entry.moduleCount === 0);

  const shown = useMemo(
    () => entries.filter(matches),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, q, hazardId, categoryId, statuses, unrelatedOnly],
  );

  const isFiltered =
    Boolean(q) ||
    hazardId !== "all" ||
    categoryId !== "all" ||
    unrelatedOnly ||
    STATUSES.some((status) => !statuses[status]);

  function resetFilters() {
    setQuery("");
    setHazardId("all");
    setCategoryId("all");
    setStatuses({ published: true, draft: true, archived: true });
    setUnrelatedOnly(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[19rem_1fr] lg:items-start">
      {/* Same dark rail as `<LawShelf>`/`<ToolExplorer>` - see the note on
          either for why the search box and the selects keep their ordinary
          light styling on this dark ground. */}
      <div className="rounded-sm bg-primary-950 p-5 text-tint lg:sticky lg:top-24">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-primary-950">
            <FilterIcon className="size-4.5" />
          </span>
          <h2 className={HEADING.cardOnDark}>Filter tools</h2>
        </div>
        <p className={`mt-2.5 ${META.onDark}`}>
          Search by title or explanation, then narrow by status, hazard or category.
        </p>

        <div className="mt-5">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search tools"
            tone="dark"
          />
        </div>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-tint">Hazard</span>
            <select
              value={hazardId}
              onChange={(event) => setHazardId(event.target.value)}
              className={`field py-2.5 ${FIELD_TONE.dark}`}
            >
              <option value="all">Any hazard</option>
              {HAZARDS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-tint">Category</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={`field py-2.5 ${FIELD_TONE.dark}`}
            >
              <option value="all">Any category</option>
              {CATEGORIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 border-t border-primary-800 pt-5">
          <p className="text-sm font-semibold text-tint">Narrow by status</p>
          <div className="mt-3 space-y-2">
            {STATUSES.map((status) => (
              <StatusToggle
                key={status}
                label={STATUS_LABEL[status]}
                count={entries.filter((entry) => entry.status === status).length}
                active={statuses[status]}
                onClick={() =>
                  setStatuses((current) => ({ ...current, [status]: !current[status] }))
                }
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setUnrelatedOnly((current) => !current)}
          aria-pressed={unrelatedOnly}
          className={`mt-5 w-full rounded-full border px-3.5 py-2.5 text-left text-sm font-medium transition-colors duration-300 ${
            unrelatedOnly
              ? "border-accent bg-accent text-primary-950"
              : "border-primary-800 bg-primary-900 text-tint hover:border-primary-600 hover:text-paper"
          }`}
        >
          Not on any module
        </button>

        <button
          type="button"
          onClick={resetFilters}
          className="mt-3 w-full rounded-full border border-primary-800 px-4 py-2.5 text-sm font-semibold text-tint transition-colors duration-300 hover:border-primary-600 hover:text-paper"
        >
          Reset filters
        </button>

        <p className={`mt-4 border-t border-primary-800 pt-4 ${META.onDark}`}>
          {entries.length} {entries.length === 1 ? "tool" : "tools"} in the directory
        </p>
      </div>

      <div>
        <p className={META.base}>
          {isFiltered
            ? `Showing ${shown.length} of ${entries.length} tools that match your filters`
            : `Showing everything in the directory — ${entries.length} ${entries.length === 1 ? "tool" : "tools"}`}
        </p>

        <div className="mt-6">
          {shown.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((entry) => (
                <ToolShelfCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No tool matches that"
              body="Try a different word, or reset the filters on the left."
              action={
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full border border-surface-deep px-4 py-2 text-sm font-semibold text-ink-soft transition-colors duration-300 hover:border-muted-light hover:text-ink"
                >
                  Reset filters
                </button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StatusToggle({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center justify-between rounded-sm border px-3.5 py-2.5 text-left text-sm font-medium transition-colors duration-300 ${
        active
          ? "border-accent bg-accent text-primary-950"
          : "border-primary-800 bg-primary-900 text-tint hover:border-primary-600 hover:text-paper"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
          active ? "bg-primary-950/20 text-primary-950" : "bg-primary-800 text-primary-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ToolShelfCard({ entry }: { entry: ToolShelfEntry }) {
  return (
    <Link
      href={`/tools-admin/${entry.id}`}
      className={`flex flex-col gap-4 ${CARD} p-5 transition-colors duration-300 hover:border-primary`}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-surface text-primary">
          <ToolIcon className="size-5" />
        </span>
        <p className="min-w-0 font-display text-lg font-semibold leading-snug text-ink">
          <span className="link-wipe">{entry.title}</span>
        </p>
      </div>

      <p className={`${BODY.base} line-clamp-3`}>{entry.explanation}</p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <Badge tone={STATUS_TONE[entry.status]}>{STATUS_LABEL[entry.status]}</Badge>
        <Badge tone={entry.moduleCount ? "info" : "warn"}>
          {entry.moduleCount
            ? `${entry.moduleCount} ${entry.moduleCount === 1 ? "module" : "modules"}`
            : "No module yet"}
        </Badge>
        <TagBadges hazardIds={entry.hazardIds} categoryIds={entry.categoryIds} />
      </div>

      {/* A tool's link leaves the platform (FR-STU-630) - shown here only as
          a plain fact, not a real "Open" affordance, since the whole card
          is already a link to this tool's own edit screen. */}
      <p className="inline-flex items-center gap-1.5 truncate text-sm text-muted">
        <LinkIcon className="size-3.5 shrink-0" />
        <span className="truncate">{entry.link}</span>
      </p>
    </Link>
  );
}
