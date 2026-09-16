"use client";

import { useMemo, useState } from "react";
import { FilterIcon } from "@/components/student-portal/icons";
import { LawCard } from "@/components/student-portal/reference-row";
import { Badge, EmptyState, FIELD_TONE, SearchField } from "@/components/student-portal/ui";
import type { Law, LearnerProvince } from "@/content/laws";
import { NATIONAL_LEARNER } from "@/content/laws";
import { HEADING, META } from "@/lib/theme";

/**
 * The Laws tab's own filter-and-browse screen.
 *
 * BUILT TO A CLIENT REFERENCE (a "Legal Framework Explorer" the client had an
 * AI tool mock up for them): a filter panel down the left, results as cards
 * grouped by level with a count against each, down the right. That reference
 * also drew a "Compliance checklist" third column - deliberately left out
 * here, since nothing in this platform's data model backs what it would show
 * and the client offered it only as inspiration, not a spec. The visual
 * language (paper cards, the portal's own type and colour tokens) is ours
 * throughout; only the STRUCTURE - a filter rail plus a card grid with live
 * counts - is borrowed.
 *
 * THREE LEVELS, not the reference's four: this library only ever scopes a Law
 * as "national" or to specific provinces (`LawScope` in `content/laws.ts`),
 * so the honest split is National, the learner's own province, and every
 * other province - never a fabricated "International" or "Local" tier this
 * platform has no data for. A "National / Head Office" learner has no
 * province of their own, so that middle level simply does not exist for
 * them (see `matchesProvince()` in `lib/laws-tools.ts`) and is left out of
 * both the toggle list and the grid rather than rendered empty.
 *
 * A CARD grid - `<LawCard>` lives in `reference-row.tsx` alongside `<LawRow>`
 * and is shared with the Module and Lecture pages' own "Related laws"
 * sections, so a law reads the same way wherever it turns up. `<LawRow>`
 * itself stays only for contexts that still want a compact single-column
 * list rather than a grid.
 */

type LevelKey = "national" | "province" | "other";

export function LawExplorer({
  nationalLaws,
  provinceLaws,
  otherLaws,
  province,
  hazardOptions,
  categoryOptions,
}: {
  nationalLaws: Law[];
  /** Laws scoped specifically to the learner's own province - empty for a
   *  "National / Head Office" learner, who has none. */
  provinceLaws: Law[];
  otherLaws: Law[];
  province: LearnerProvince;
  hazardOptions: { id: string; label: string }[];
  categoryOptions: { id: string; label: string }[];
}) {
  const hasOwnProvince = province !== NATIONAL_LEARNER && provinceLaws.length > 0;

  const [query, setQuery] = useState("");
  const [hazardId, setHazardId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [levels, setLevels] = useState<Record<LevelKey, boolean>>({
    national: true,
    province: true,
    other: true,
  });

  const q = query.trim().toLowerCase();
  const matches = (law: Law) =>
    (!q ||
      law.title.toLowerCase().includes(q) ||
      law.reference.toLowerCase().includes(q)) &&
    (hazardId === "all" || law.hazardIds.includes(hazardId)) &&
    (categoryId === "all" || law.categoryIds.includes(categoryId));

  const filtered = useMemo(
    () => ({
      national: nationalLaws.filter(matches),
      province: provinceLaws.filter(matches),
      other: otherLaws.filter(matches),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nationalLaws, provinceLaws, otherLaws, q, hazardId, categoryId],
  );

  const sections: { id: LevelKey; label: string; items: Law[] }[] = [
    { id: "national", label: "National", items: filtered.national },
    ...(hasOwnProvince
      ? [{ id: "province" as const, label: province, items: filtered.province }]
      : []),
    { id: "other", label: "Other provinces", items: filtered.other },
  ];

  const visibleSections = sections.filter(
    (section) => levels[section.id] && section.items.length > 0,
  );
  const totalFiltered = sections.reduce((sum, section) => sum + section.items.length, 0);
  const totalAll = nationalLaws.length + provinceLaws.length + otherLaws.length;
  const isFiltered = Boolean(q) || hazardId !== "all" || categoryId !== "all";

  function resetFilters() {
    setQuery("");
    setHazardId("all");
    setCategoryId("all");
    setLevels({ national: true, province: true, other: true });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[19rem_1fr] lg:items-start">
      {/* DARK, LIKE THE RAIL - `bg-primary-950`/`text-tint`, the exact recipe
          `<ContinueCard>` on the dashboard already uses for "this block is
          not like the others on this page." Not `<Panel>` with overrides:
          `<ContinueCard>` itself skips `Panel` for the same dark treatment
          rather than fighting its light `bg-paper-raised`/`border-surface-deep`
          defaults, and doing the same here means every colour below is
          chosen, not an override racing the cascade. The search box and the
          two selects stay their ordinary light `.field` styling on purpose -
          globals.css is explicit that a form control "has no such problem -
          it is always on paper" (see its own comment on `.field:focus-visible`),
          so this keeps the same white input floating on a dark tray rather
          than inventing a second, dark input skin nothing else in the
          product has. */}
      <div className="rounded-sm bg-primary-950 p-5 text-tint lg:sticky lg:top-24">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-primary-950">
            <FilterIcon className="size-4.5" />
          </span>
          <h2 className={HEADING.cardOnDark}>Find a law</h2>
        </div>
        <p className={`mt-2.5 ${META.onDark}`}>
          Search by title or citation, then narrow by hazard, category or level.
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

        <div className="mt-5 border-t border-primary-800 pt-5">
          <p className="text-sm font-semibold text-tint">Narrow by level</p>
          <div className="mt-3 space-y-2">
            {sections.map((section) => (
              <LevelToggle
                key={section.id}
                label={section.label}
                count={section.items.length}
                active={levels[section.id]}
                onClick={() =>
                  setLevels((current) => ({ ...current, [section.id]: !current[section.id] }))
                }
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="mt-5 w-full rounded-full border border-primary-800 px-4 py-2.5 text-sm font-semibold text-tint transition-colors duration-300 hover:border-primary-600 hover:text-paper"
        >
          Reset filters
        </button>

        <p className={`mt-4 border-t border-primary-800 pt-4 ${META.onDark}`}>
          {totalAll} {totalAll === 1 ? "law" : "laws"} in the library
          {hasOwnProvince ? ` · ${sections.length} levels` : ""}
        </p>
      </div>

      <div>
        <p className={META.base}>
          {isFiltered
            ? `Showing ${totalFiltered} of ${totalAll} laws that match your filters`
            : `Showing everything in the register — ${totalAll} ${totalAll === 1 ? "law" : "laws"}`}
        </p>

        <div className="mt-6 space-y-10">
          {visibleSections.length ? (
            visibleSections.map((section) => (
              <div key={section.id}>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <h3 className={HEADING.card}>{section.label}</h3>
                  <Badge tone="info">
                    {section.items.length} {section.items.length === 1 ? "law" : "laws"}
                  </Badge>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {section.items.map((law) => (
                    <LawCard key={law.id} law={law} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No law matches that"
              body="Try a different word, or reset the filters on the left - the library is still small enough that most searches are one adjustment away from something."
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

function LevelToggle({
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
