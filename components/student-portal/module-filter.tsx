"use client";

import { useState, type ReactNode } from "react";
import type { EnrolmentStatus } from "@/content/portal";
import { EmptyState } from "@/components/student-portal/ui";
import { FilterIcon } from "@/components/student-portal/icons";

/**
 * The catalogue's filter.
 *
 * The cards are NOT rebuilt on the client. Each one arrives already rendered
 * on the server and is carried through as a `ReactNode`, so this component
 * only ever decides which of them to mount - the 42-lecture curriculum, the
 * module copy and the progress arithmetic all stay on the server and none
 * of it is serialised into the page. The client bundle for this screen is one
 * `useState` and four buttons.
 *
 * Buttons rather than links to `?filter=`, deliberately. Filtering a list of
 * five is a glance, not a destination: a URL round trip per press would put a
 * navigation between the learner and something already on their screen. If the
 * catalogue ever grows to the point where a filtered view is worth sharing or
 * bookmarking, that trade flips and this should become links.
 */

type Filter = "all" | EnrolmentStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in-progress", label: "In progress" },
  { id: "completed", label: "Completed" },
  { id: "not-started", label: "Not started" },
];

export type FilterableModule = {
  id: string;
  status: EnrolmentStatus;
  card: ReactNode;
};

export function ModuleFilter({ items }: { items: FilterableModule[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = items.filter(
    (item) => filter === "all" || item.status === filter,
  );

  const countFor = (id: Filter) =>
    id === "all"
      ? items.length
      : items.filter((item) => item.status === id).length;

  return (
    <div>
      {/* DARK, LIKE THE RAIL - the same `bg-primary-950`/`text-tint`/`accent`
          recipe `<LawExplorer>`'s own filter panel uses (see the note
          there), applied to a horizontal bar instead of a sidebar. A row of
          pill buttons on the plain page background reads as a second row of
          status badges - the module cards right below already have their
          own "Foundation"/"Completed" pills - and colour now does the same
          job the label alone was doing before: nothing else on this page is
          this dark, so the eye finds it immediately. */}
      <div className="rounded-sm bg-primary-950 px-5 py-4 text-tint">
        <div className="flex items-center gap-2">
          <FilterIcon className="size-4 shrink-0 text-primary-500" />
          <span className="text-sm font-semibold text-tint">Filter by progress</span>
        </div>

        {/* `tablist` would promise arrow-key navigation between panels, and
            these are filters over one list rather than tabs over several. A
            group of pressed/unpressed buttons is what this actually is. */}
        <div
          role="group"
          aria-label="Filter modules"
          className="mt-3 flex flex-wrap gap-2"
        >
          {FILTERS.map((option) => {
            const active = filter === option.id;
            const count = countFor(option.id);

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                aria-pressed={active}
                // Disabled rather than hidden when a filter would empty the
                // list: a control that disappears as you use the page is one
                // people stop trusting.
                disabled={count === 0}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-base font-semibold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${active
                    ? "border-accent bg-accent text-primary-950"
                    : "border-primary-800 bg-primary-900 text-tint hover:border-primary-600 hover:text-paper"
                  }`}
              >
                {option.label}
                <span
                  className={`text-sm font-medium ${active ? "text-primary-950/70" : "text-primary-500"
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        {visible.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.map((item) => (
              <div key={item.id}>{item.card}</div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nothing in this view"
            body="No module is at that stage yet. Switch the filter above to see the rest of the catalogue."
          />
        )}
      </div>
    </div>
  );
}
