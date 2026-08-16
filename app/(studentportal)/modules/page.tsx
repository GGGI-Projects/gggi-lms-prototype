import type { Metadata } from "next";
import { ModuleCard } from "@/components/student-portal/module-card";
import { ModuleFilter } from "@/components/student-portal/module-filter";
import { PageBody, PageHeader, StatTile } from "@/components/student-portal/ui";
import { allProgress } from "@/lib/portal";
import { TOTALS } from "@/content/site";
import { PORTAL } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Modules",
  description:
    "Every module on the platform - free, self-paced, and open to enrol at any time.",
};

/**
 * The catalogue.
 *
 * It shows EVERY module in one grid rather than splitting "yours" from
 * "available" into two sections. The two are the same five things, and a split
 * catalogue makes a learner look in two places to answer "what is there?" -
 * the state a module is in is already on its card, in a badge and a
 * progress bar. The dashboard is where enrolments get their own section,
 * because there the question is "what am I in the middle of".
 */
export default function ModulesPage() {
  const modules = allProgress();

  return (
    <PageBody>
      <PageHeader
        eyebrow="Modules"
        title="Five foundations. Start where your work does."
        lead="Each one is self-contained, so there is no order to follow and nothing to complete first. Enrol in as many as you like - they are all free, and your progress is kept separately for each."
      />

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatTile value={TOTALS.modules} label="Modules" />
        <StatTile value={TOTALS.lectures} label="Lectures" />
        <StatTile value={`${TOTALS.hours}h`} label="Hours of material" />
      </dl>

      <div className={PORTAL.stack}>
        <ModuleFilter
          items={modules.map((entry) => ({
            id: entry.module.id,
            status: entry.status,
            // Rendered here, on the server, and handed over as a finished
            // element - see the note in `<ModuleFilter>`.
            card: <ModuleCard progress={entry} />,
          }))}
        />
      </div>
    </PageBody>
  );
}
