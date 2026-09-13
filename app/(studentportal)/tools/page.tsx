import type { Metadata } from "next";
import { ToolRow } from "@/components/student-portal/reference-row";
import { ReferenceFilter } from "@/components/student-portal/reference-filter";
import { PageBody, PageHeader, StatTile } from "@/components/student-portal/ui";
import { allTags } from "@/content/tags";
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
 * the same way a Law and a Module are, so the same `<ReferenceFilter>`
 * fits without a section label to show.
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

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatTile value={tools.length} label="Tools in the directory" />
        <StatTile value={allTags().length} label="Tags they are organised by" />
      </dl>

      <div className={PORTAL.stack}>
        <ReferenceFilter
          searchPlaceholder="Search tools by title"
          emptyTitle="No tool matches that search"
          emptyBody="Try a different word, or clear the tag filter above."
          tagOptions={allTags()}
          sections={[
            {
              id: "all",
              items: tools.map((tool) => ({
                id: tool.id,
                title: tool.title,
                tagIds: [...tool.hazardIds, ...tool.categoryIds],
                row: <ToolRow tool={tool} />,
              })),
            },
          ]}
        />
      </div>
    </PageBody>
  );
}
