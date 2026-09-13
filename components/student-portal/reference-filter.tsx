"use client";

import { useState, type ReactNode } from "react";
import { EmptyState, SearchField } from "@/components/student-portal/ui";
import { HEADING, META } from "@/lib/theme";

/**
 * The Laws and Tools tabs' shared filter.
 *
 * SAME PHILOSOPHY AS `<ModuleFilter>`: a row is rendered once, on the server,
 * and carried through as a `ReactNode` - this component only ever decides
 * which of them stay mounted. Filtering a library that will only ever be a
 * few dozen entries is a glance, not a destination, so a text box and a row
 * of buttons that filter in place beat a `?tag=` URL round trip - the same
 * call `<ModuleFilter>` already made for the module catalogue.
 *
 * SECTIONS, not a flat list, because the Laws tab is never one list - a
 * learner's own province has to sit above every other province's laws
 * (FR-STU-500), and that split has to survive filtering rather than being
 * flattened by it. A `label`-less section (the Tools tab has exactly one)
 * renders with no heading at all, so the two screens share one component
 * without the Tools tab acquiring a redundant "Tools" heading over its own
 * page title.
 */

export type ReferenceEntry = {
  id: string;
  title: string;
  /** Every tag id this entry carries - hazards and categories together, so
   *  one filter row can search across both lists at once. */
  tagIds: string[];
  row: ReactNode;
};

export type ReferenceSection = {
  id: string;
  label?: string;
  description?: string;
  items: ReferenceEntry[];
};

export function ReferenceFilter({
  sections,
  tagOptions,
  searchPlaceholder,
  emptyTitle,
  emptyBody,
}: {
  sections: ReferenceSection[];
  tagOptions: { id: string; label: string }[];
  searchPlaceholder: string;
  emptyTitle: string;
  emptyBody: string;
}) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("all");

  const q = query.trim().toLowerCase();
  const matches = (entry: ReferenceEntry) =>
    (!q || entry.title.toLowerCase().includes(q)) &&
    (tag === "all" || entry.tagIds.includes(tag));

  const visibleSections = sections
    .map((section) => ({ ...section, items: section.items.filter(matches) }))
    .filter((section) => section.items.length > 0);

  return (
    <div>
      {/* Stacked, not a row: with up to fifteen tag buttons across both
          dynamic option lists, there is no width at which those and the
          search field share a line without one squeezing the other - a
          `justify-between` row here let the tag group's wrapped width push
          the search field down to a few characters wide. */}
      <div className="flex flex-col gap-4">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={searchPlaceholder}
          className="sm:max-w-sm"
        />
        <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-2">
          <TagButton active={tag === "all"} onClick={() => setTag("all")}>
            All
          </TagButton>
          {tagOptions.map((option) => (
            <TagButton
              key={option.id}
              active={tag === option.id}
              onClick={() => setTag(option.id)}
            >
              {option.label}
            </TagButton>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {visibleSections.length ? (
          visibleSections.map((section) => (
            <div key={section.id}>
              {section.label ? (
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <h2 className={HEADING.card}>{section.label}</h2>
                  <p className={META.base}>
                    {section.items.length}{" "}
                    {section.items.length === 1 ? "entry" : "entries"}
                  </p>
                </div>
              ) : null}
              {section.description ? (
                <p className={`mt-2 ${META.base}`}>{section.description}</p>
              ) : null}
              <ul
                className={`overflow-hidden rounded-sm border border-surface-deep bg-paper-raised divide-y divide-surface-deep ${section.label ? "mt-5" : ""}`}
              >
                {section.items.map((entry) => (
                  <li key={entry.id}>{entry.row}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <EmptyState title={emptyTitle} body={emptyBody} />
        )}
      </div>
    </div>
  );
}

function TagButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors duration-300 ${
        active
          ? "border-primary bg-primary text-paper"
          : "border-surface-deep bg-paper-raised text-ink-soft hover:border-muted-light hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
