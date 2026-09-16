import type { Metadata } from "next";
import { LawExplorer } from "@/components/student-portal/law-explorer";
import { PageBody, PageHeader, StatTile } from "@/components/student-portal/ui";
import { CATEGORIES, HAZARDS } from "@/content/tags";
import { LEARNER } from "@/content/portal";
import { lawsForLearner } from "@/lib/laws-tools";
import { PORTAL } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Laws",
  description: "Environmental law, national and provincial, kept current by the platform's Laws Administrator.",
};

/**
 * The Laws tab.
 *
 * THREE LEVELS, always, never a single flattened list - national law, the
 * learner's own province, and every other province, in that order (see
 * `<LawExplorer>` for why the client's own four-level reference doesn't
 * apply verbatim here). `lawsForLearner()` gives the two-way split this
 * page then breaks `own` apart from - national law is always relevant to
 * everyone, so it deserves its own level rather than being buried inside
 * "Southern".
 *
 * A Law is never reached from a Module or a Lecture page as a second copy -
 * both link back here, filtered (see FR-STU-530). This tab is the one place
 * the document itself lives.
 */
export default function LawsPage() {
  const { own, other } = lawsForLearner(LEARNER.province);
  const nationalLaws = own.filter((law) => law.scope === "national");
  const provinceLaws = own.filter((law) => law.scope !== "national");

  return (
    <PageBody>
      <PageHeader
        eyebrow="Laws"
        title="Environmental law for your province, and every other one"
        lead={`Every law in this library is tagged the same way a Module is - by hazard and by category - which is how a Module's own page knows which of these to point you at. ${LEARNER.province} sits first below because that is where your own account is registered; everything else is one search away.`}
      />

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatTile value={own.length + other.length} label="Laws in the library" />
        <StatTile value={own.length} label={`Covering ${LEARNER.province}`} />
        <StatTile value={other.length} label="From other provinces" />
      </dl>

      <div className={PORTAL.stack}>
        <LawExplorer
          nationalLaws={nationalLaws}
          provinceLaws={provinceLaws}
          otherLaws={other}
          province={LEARNER.province}
          hazardOptions={HAZARDS}
          categoryOptions={CATEGORIES}
        />
      </div>
    </PageBody>
  );
}
