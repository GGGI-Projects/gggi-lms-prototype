import type { Metadata } from "next";
import { ProgrammeCard } from "@/components/student-portal/programme-card";
import { ProgrammeFilter } from "@/components/student-portal/programme-filter";
import { PageBody, PageHeader, StatTile } from "@/components/student-portal/ui";
import { allProgress } from "@/lib/portal";
import { TOTALS } from "@/content/site";
import { PORTAL } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Every programme on the platform - free, self-paced, and open to enrol at any time.",
};

/**
 * The catalogue.
 *
 * It shows EVERY programme in one grid rather than splitting "yours" from
 * "available" into two sections. The two are the same five things, and a split
 * catalogue makes a learner look in two places to answer "what is there?" -
 * the state a programme is in is already on its card, in a badge and a
 * progress bar. The dashboard is where enrolments get their own section,
 * because there the question is "what am I in the middle of".
 */
export default function ProgrammesPage() {
  const programmes = allProgress();

  return (
    <PageBody>
      <PageHeader
        eyebrow="Programmes"
        title="Five foundations. Start where your work does."
        lead="Each one is self-contained, so there is no order to follow and nothing to complete first. Enrol in as many as you like - they are all free, and your progress is kept separately for each."
      />

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatTile value={TOTALS.programmes} label="Programmes" />
        <StatTile value={TOTALS.modules} label="Modules" />
        <StatTile value={`${TOTALS.hours}h`} label="Hours of material" />
      </dl>

      <div className={PORTAL.stack}>
        <ProgrammeFilter
          items={programmes.map((entry) => ({
            id: entry.programme.id,
            status: entry.status,
            // Rendered here, on the server, and handed over as a finished
            // element - see the note in `<ProgrammeFilter>`.
            card: <ProgrammeCard progress={entry} />,
          }))}
        />
      </div>
    </PageBody>
  );
}
