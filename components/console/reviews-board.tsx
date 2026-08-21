"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import { FilterIcon } from "@/components/console/icons";
import { Panel, Section } from "@/components/console/ui";
import { BODY, CONSOLE } from "@/lib/theme";

/**
 * A moderation card, tagged with what it is about.
 *
 * Same arrangement as `Register`: the card is built and rendered on the
 * server - it holds `IfCan`-gated actions and a flagged callout that need no
 * client logic of their own - and handed here as a finished `ReactNode`. Only
 * the "which subject" decision happens in the browser.
 */
export type ReviewCard = {
  id: string;
  /** Matches one `ReviewFilter.value` below - `"module:<id>"` or
   *  `"lecturer:<id>"`, never a bare id, so a module and a lecturer that
   *  happen to share an id can never be confused by the filter. */
  filterKey: string;
  row: ReactNode;
};

export type ReviewFilter = {
  value: string;
  label: string;
  group: "Modules" | "Lecturers";
};

/**
 * The two review sections, narrowed to one module or lecturer at a time.
 *
 * A SELECT, not chips, for the same reason the register uses one for its
 * module filter: a dozen names read as a list, not a row of buttons. One
 * control narrows both sections at once, because "what is waiting on this
 * subject" and "what was already decided for it" are the same question asked
 * at two points in time - splitting the filter in two would answer neither
 * well. GROUPED, because a module review and a lecturer review are answering
 * two different questions ("was the material good" against "was the
 * teaching good") and a mixed alphabetical list would blur that.
 */
export function ReviewsBoard({
  pending,
  decided,
  filters,
}: {
  pending: ReviewCard[];
  decided: ReviewCard[];
  filters: ReviewFilter[];
}) {
  const [filterKey, setFilterKey] = useState("all");

  const shownPending = useMemo(
    () =>
      filterKey === "all"
        ? pending
        : pending.filter((card) => card.filterKey === filterKey),
    [pending, filterKey],
  );
  const shownDecided = useMemo(
    () =>
      filterKey === "all"
        ? decided
        : decided.filter((card) => card.filterKey === filterKey),
    [decided, filterKey],
  );

  const modules = filters.filter((entry) => entry.group === "Modules");
  const lecturers = filters.filter((entry) => entry.group === "Lecturers");

  return (
    <>
      <div
        role="group"
        aria-label="Filter reviews"
        className="flex flex-wrap items-center gap-2"
      >
        <FilterIcon className="size-4 shrink-0 text-muted-light" />
        <label className="block w-full sm:w-auto sm:max-w-sm">
          <span className="sr-only">Module or lecturer</span>
          <select
            value={filterKey}
            onChange={(event) => setFilterKey(event.target.value)}
            className="field py-2.5"
          >
            <option value="all">Everyone</option>
            <optgroup label="Modules">
              {modules.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Lecturers">
              {lecturers.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>

      <Section
        title="Waiting for a decision"
        description="Oldest first, except anything flagged."
        className={CONSOLE.stack}
      >
        {shownPending.length ? (
          <ul className="space-y-4">
            {shownPending.map((card) => (
              <Fragment key={card.id}>{card.row}</Fragment>
            ))}
          </ul>
        ) : (
          <Panel>
            <p className={BODY.base}>
              {pending.length
                ? "Nothing waiting matches that."
                : "Nothing is waiting. The queue is clear."}
            </p>
          </Panel>
        )}
      </Section>

      <Section
        title="Already decided"
        description="Kept so that a decision can be explained months later."
        className={CONSOLE.stack}
      >
        <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
          {shownDecided.length ? (
            shownDecided.map((card) => (
              <Fragment key={card.id}>{card.row}</Fragment>
            ))
          ) : (
            <li className="px-5 py-14 text-center text-lg text-muted">
              Nothing decided matches that.
            </li>
          )}
        </ul>
      </Section>
    </>
  );
}
