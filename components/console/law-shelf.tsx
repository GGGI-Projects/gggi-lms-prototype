"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterIcon, LawIcon, MapPinIcon } from "@/components/student-portal/icons";
import { TagBadges } from "@/components/student-portal/reference-row";
import { Badge, EmptyState, FIELD_TONE, SearchField } from "@/components/student-portal/ui";
import { CATEGORIES, HAZARDS } from "@/content/tags";
import { BODY, CARD, HEADING, META } from "@/lib/theme";

/**
 * The Law library's own list, as a filter rail + card grid.
 *
 * SAME STRUCTURE AS `<LawExplorer>` (the learner-facing Laws tab's own
 * screen, `components/student-portal/law-explorer.tsx`) on purpose - a Laws
 * Administrator filtering this register and a learner filtering their own
 * reads the same interface, down to the dark filter panel and the card
 * grid, rather than the register looking like a different, plainer product.
 * `<LawCard>` (`reference-row.tsx`) is reused for the visual shape; this
 * file's own card adds what a learner's card has no reason to show - status
 * and how many modules relate to it - and links to the edit screen instead
 * of a document.
 *
 * NO LEVEL SECTIONS, unlike `<LawExplorer>` - National / own-province /
 * other-province is a LEARNER's vantage point (FR-STU-500); a Laws
 * Administrator manages the whole register at once, so the one axis that
 * replaces it here is STATUS (published / draft / archived), the question
 * this console screen actually exists to answer, using the exact same
 * toggle-list widget the portal built for levels.
 */

export type LawShelfEntry = {
  id: string;
  title: string;
  summary: string;
  reference: string;
  scope: string;
  status: "draft" | "published" | "archived";
  hazardIds: string[];
  categoryIds: string[];
  moduleCount: number;
};

const STATUSES: LawShelfEntry["status"][] = ["published", "draft", "archived"];

const STATUS_LABEL: Record<LawShelfEntry["status"], string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

const STATUS_TONE: Record<LawShelfEntry["status"], "done" | "neutral" | "warn"> = {
  published: "done",
  draft: "neutral",
  archived: "warn",
};

export function LawShelf({ entries }: { entries: LawShelfEntry[] }) {
  const [query, setQuery] = useState("");
  const [hazardId, setHazardId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [statuses, setStatuses] = useState<Record<LawShelfEntry["status"], boolean>>({
    published: true,
    draft: true,
    archived: true,
  });
  const [unrelatedOnly, setUnrelatedOnly] = useState(false);

  const q = query.trim().toLowerCase();
  const matches = (entry: LawShelfEntry) =>
    (!q ||
      `${entry.title} ${entry.summary} ${entry.reference}`.toLowerCase().includes(q)) &&
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
      {/* The same dark rail `<LawExplorer>` uses - see the note there on why
          the search box and the selects keep their ordinary light styling on
          this dark ground rather than a second, hand-built dark input skin. */}
      <div className="rounded-sm bg-primary-950 p-5 text-tint lg:sticky lg:top-24">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-primary-950">
            <FilterIcon className="size-4.5" />
          </span>
          <h2 className={HEADING.cardOnDark}>Filter laws</h2>
        </div>
        <p className={`mt-2.5 ${META.onDark}`}>
          Search by title, reference or summary, then narrow by status, hazard or category.
        </p>

        <div className="mt-5">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Search laws"
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
          {entries.length} {entries.length === 1 ? "law" : "laws"} in the library
        </p>
      </div>

      <div>
        <p className={META.base}>
          {isFiltered
            ? `Showing ${shown.length} of ${entries.length} laws that match your filters`
            : `Showing everything in the register — ${entries.length} ${entries.length === 1 ? "law" : "laws"}`}
        </p>

        <div className="mt-6">
          {shown.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((entry) => (
                <LawShelfCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No law matches that"
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

function LawShelfCard({ entry }: { entry: LawShelfEntry }) {
  return (
    <Link
      href={`/laws-admin/${entry.id}`}
      className={`flex flex-col gap-4 ${CARD} p-5 transition-colors duration-300 hover:border-primary`}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-surface text-primary">
          <LawIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-snug text-ink">
            <span className="link-wipe">{entry.title}</span>
          </p>
          <p className={`mt-0.5 ${META.base}`}>{entry.reference}</p>
        </div>
      </div>

      <p className={`${BODY.base} line-clamp-3`}>{entry.summary}</p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <Badge tone={STATUS_TONE[entry.status]}>{STATUS_LABEL[entry.status]}</Badge>
        <Badge icon={<MapPinIcon className="size-3.5" />}>{entry.scope}</Badge>
        <Badge tone={entry.moduleCount ? "info" : "warn"}>
          {entry.moduleCount
            ? `${entry.moduleCount} ${entry.moduleCount === 1 ? "module" : "modules"}`
            : "No module yet"}
        </Badge>
        <TagBadges hazardIds={entry.hazardIds} categoryIds={entry.categoryIds} />
      </div>
    </Link>
  );
}
