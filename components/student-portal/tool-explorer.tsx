"use client";

import { useMemo, useState } from "react";
import { FilterIcon } from "@/components/student-portal/icons";
import { ToolCard } from "@/components/student-portal/reference-row";
import { EmptyState, FIELD_TONE, SearchField } from "@/components/student-portal/ui";
import type { Tool } from "@/content/tools";
import { HEADING, META } from "@/lib/theme";

/**
 * The Tools tab's own filter-and-browse screen.
 *
 * SAME STRUCTURE AS `<LawExplorer>` - a filter rail down the left, results as
 * cards down the right - built to the same client reference and for the
 * same reason: see the note there for why the "Compliance checklist" third
 * column the reference also drew is left out.
 *
 * ONE FLAT GRID, never sectioned - unlike a Law, a Tool carries no province
 * scope (FR-STU-630), so there is no structural axis here the way National /
 * own-province / other-province is for a Law. Category is close to a
 * "sector" a learner might expect to browse by, but a Tool can carry several
 * categories at once, and sectioning by an overlapping tag would show the
 * same tool twice - dishonest grouping in service of looking like the Laws
 * screen. A search box plus two tag filters is the whole sidebar; padding it
 * out with a toggle list that has nothing real to toggle would be decoration,
 * not function.
 */
export function ToolExplorer({
  tools,
  hazardOptions,
  categoryOptions,
}: {
  tools: Tool[];
  hazardOptions: { id: string; label: string }[];
  categoryOptions: { id: string; label: string }[];
}) {
  const [query, setQuery] = useState("");
  const [hazardId, setHazardId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");

  const q = query.trim().toLowerCase();
  const matches = (tool: Tool) =>
    (!q ||
      tool.title.toLowerCase().includes(q) ||
      tool.explanation.toLowerCase().includes(q)) &&
    (hazardId === "all" || tool.hazardIds.includes(hazardId)) &&
    (categoryId === "all" || tool.categoryIds.includes(categoryId));

  const shown = useMemo(
    () => tools.filter(matches),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tools, q, hazardId, categoryId],
  );

  const isFiltered = Boolean(q) || hazardId !== "all" || categoryId !== "all";

  function resetFilters() {
    setQuery("");
    setHazardId("all");
    setCategoryId("all");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[19rem_1fr] lg:items-start">
      {/* Same dark treatment as `<LawExplorer>`'s own filter panel, for the
          same reason - see the note there. */}
      <div className="rounded-sm bg-primary-950 p-5 text-tint lg:sticky lg:top-24">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-primary-950">
            <FilterIcon className="size-4.5" />
          </span>
          <h2 className={HEADING.cardOnDark}>Find a tool</h2>
        </div>
        <p className={`mt-2.5 ${META.onDark}`}>
          Search by name, then narrow by hazard or category.
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
              {hazardOptions.map((option) => (
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
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="mt-5 w-full rounded-full border border-primary-800 px-4 py-2.5 text-sm font-semibold text-tint transition-colors duration-300 hover:border-primary-600 hover:text-paper"
        >
          Reset filters
        </button>

        <p className={`mt-4 border-t border-primary-800 pt-4 ${META.onDark}`}>
          {tools.length} {tools.length === 1 ? "tool" : "tools"} in the directory
        </p>
      </div>

      <div>
        <p className={META.base}>
          {isFiltered
            ? `Showing ${shown.length} of ${tools.length} tools that match your filters`
            : `Showing everything in the directory — ${tools.length} ${tools.length === 1 ? "tool" : "tools"}`}
        </p>

        <div className="mt-6">
          {shown.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No tool matches that"
              body="Try a different word, or reset the filters on the left - the directory is still small enough that most searches are one adjustment away from something."
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
