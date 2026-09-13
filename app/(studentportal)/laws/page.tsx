import type { Metadata } from "next";
import { LawRow } from "@/components/student-portal/reference-row";
import { ReferenceFilter } from "@/components/student-portal/reference-filter";
import { PageBody, PageHeader, StatTile } from "@/components/student-portal/ui";
import { allTags } from "@/content/tags";
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
 * TWO SECTIONS, always, never a single flattened list - `lawsForLearner()`
 * does the split (national laws plus anything scoped to Galle's own
 * Southern Province come first; every other province's laws sit below), and
 * this page keeps that split through the filter rather than letting a
 * search or a tag pick collapse it back into one list (see FR-STU-500).
 *
 * A Law is never reached from a Module or a Lecture page as a second copy -
 * both link back here, filtered (see FR-STU-530). This tab is the one place
 * the document itself lives.
 */
export default function LawsPage() {
  const { own, other } = lawsForLearner(LEARNER.province);

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
        <ReferenceFilter
          searchPlaceholder="Search laws by title"
          emptyTitle="No law matches that search"
          emptyBody="Try a different word, or clear the tag filter above - the library is still small enough that most searches are one adjustment away from something."
          tagOptions={allTags()}
          sections={[
            {
              id: "own",
              label: `${LEARNER.province} (and national law)`,
              items: own.map((law) => ({
                id: law.id,
                title: law.title,
                tagIds: [...law.hazardIds, ...law.categoryIds],
                row: <LawRow law={law} />,
              })),
            },
            {
              id: "other",
              label: "Other provinces",
              items: other.map((law) => ({
                id: law.id,
                title: law.title,
                tagIds: [...law.hazardIds, ...law.categoryIds],
                row: <LawRow law={law} />,
              })),
            },
          ]}
        />
      </div>
    </PageBody>
  );
}
