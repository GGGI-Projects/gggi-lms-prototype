"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import { FilterIcon } from "@/components/console/icons";
import { Panel, Section } from "@/components/console/ui";
import { BODY, CONSOLE } from "@/lib/theme";

/**
 * A moderation card, tagged with the module it belongs to.
 *
 * Same arrangement as `Register`: the card is built and rendered on the
 * server - it holds `IfCan`-gated actions and a flagged callout that need no
 * client logic of their own - and handed here as a finished `ReactNode`. Only
 * the "which module" decision happens in the browser.
 */
export type ReviewCard = {
  id: string;
  moduleId: string;
  row: ReactNode;
};

/**
 * The two review sections, narrowed to one module at a time.
 *
 * A SELECT, not chips, for the same reason the register uses one for its
 * module filter: five module titles read as a list, not a row of buttons.
 * One control narrows both sections at once, because "what is waiting on
 * this module" and "what was already decided for it" are the same question
 * asked at two points in time - splitting the filter in two would answer
 * neither well.
 */
export function ReviewsBoard({
  pending,
  decided,
  modules,
}: {
  pending: ReviewCard[];
  decided: ReviewCard[];
  modules: { id: string; title: string }[];
}) {
  const [moduleId, setModuleId] = useState("all");

  const shownPending = useMemo(
    () =>
      moduleId === "all"
        ? pending
        : pending.filter((card) => card.moduleId === moduleId),
    [pending, moduleId],
  );
  const shownDecided = useMemo(
    () =>
      moduleId === "all"
        ? decided
        : decided.filter((card) => card.moduleId === moduleId),
    [decided, moduleId],
  );

  return (
    <>
      <div
        role="group"
        aria-label="Filter reviews"
        className="flex flex-wrap items-center gap-2"
      >
        <FilterIcon className="size-4 shrink-0 text-muted-light" />
        <label className="block w-full sm:w-auto sm:max-w-sm">
          <span className="sr-only">Module</span>
          <select
            value={moduleId}
            onChange={(event) => setModuleId(event.target.value)}
            className="field py-2.5"
          >
            <option value="all">Every module</option>
            {modules.map((mdl) => (
              <option key={mdl.id} value={mdl.id}>
                {mdl.title}
              </option>
            ))}
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
                ? "Nothing waiting matches that module."
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
              Nothing decided matches that module.
            </li>
          )}
        </ul>
      </Section>
    </>
  );
}
