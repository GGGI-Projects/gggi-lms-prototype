import type { Metadata } from "next";
import { ToolExplorer } from "@/components/student-portal/tool-explorer";
import { PageBody, PageHeader, StatTile } from "@/components/student-portal/ui";
import { CATEGORIES, HAZARDS, allTags } from "@/content/tags";
import { publishedTools } from "@/lib/laws-tools";
import { PORTAL } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Tools",
  description: "Practical tools for climate and inclusion work, kept current by the platform's Tools Administrator.",
};

/**
 * The Tools tab.
 *
 * ONE FLAT LIST, unlike the Laws tab - a Tool carries no province scope (see
 * FR-STU-630), so there is no split to preserve here. It is still tagged
 * the same way a Law and a Module are, so `<ToolExplorer>` offers the same
 * hazard/category filters the Laws tab's `<LawExplorer>` does - see the note
 * there on why neither screen adds the reference's "Compliance checklist".
 *
 * Opening a tool leaves the platform - the link is the tool, and this
 * page's only job is to keep the link and the explanation current, not to
 * host what it points to.
 */
export default function ToolsPage() {
  const tools = publishedTools();

  return (
    <PageBody>
      <PageHeader
        eyebrow="Tools"
        title="Practical tools for the work each module leads to"
        lead="A link and a plain explanation of what it is for, per tool - tagged the same way a module and a law are, so a module's own page can point you at exactly the ones its subject actually uses."
      />

      <dl className="mt-10 grid gap-4 sm:grid-cols-2">
        <StatTile value={tools.length} label="Tools in the directory" />
        <StatTile value={allTags().length} label="Tags they are organised by" />
      </dl>

      <div className={PORTAL.stack}>
        <ToolExplorer tools={tools} hazardOptions={HAZARDS} categoryOptions={CATEGORIES} />
      </div>
    </PageBody>
  );
}
