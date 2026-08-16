"use client";

import { useState, type ReactNode } from "react";
import type { EnrolmentStatus } from "@/content/portal";
import { EmptyState } from "@/components/student-portal/ui";

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
      {/* `tablist` would promise arrow-key navigation between panels, and
          these are filters over one list rather than tabs over several. A
          group of pressed/unpressed buttons is what this actually is. */}
      <div
        role="group"
        aria-label="Filter modules"
        className="flex flex-wrap gap-2"
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
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-lg font-semibold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${active
                  ? "border-primary bg-primary text-paper"
                  : "border-surface-deep bg-paper-raised text-ink-soft hover:border-muted-light hover:text-ink"
                }`}
            >
              {option.label}
              <span
                className={`text-sm font-medium ${active ? "text-tint" : "text-muted"
                  }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {visible.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
