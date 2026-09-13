import {
  DownloadIcon,
  LawIcon,
  LinkIcon,
  MapPinIcon,
  ToolIcon,
} from "@/components/student-portal/icons";
import { Badge } from "@/components/student-portal/ui";
import { categoryLabel, hazardLabel } from "@/content/tags";
import type { Law } from "@/content/laws";
import type { Tool } from "@/content/tools";
import { scopeLabel } from "@/lib/laws-tools";
import { BODY, META } from "@/lib/theme";

/**
 * One Law or one Tool, as a row - the Laws and Tools tabs' equivalent of
 * `<MaterialsList>`'s row, and deliberately in that shape: an icon standing
 * for what the row IS, the essential facts, and one action on the end. What
 * differs is that these rows carry TAGS - a learner filtering the tab by
 * "Flooding" is reading the same badges `<ReferenceFilter>` filters against,
 * so the row has to show exactly what it can be found by.
 *
 * Two components rather than one taking a union, because a Law's province
 * scope has no equivalent on a Tool (FR-STU-630 - a Tool is deliberately
 * province-agnostic) and a shared component would need a branch for a field
 * that only ever appears on one side of it.
 */

function TagBadges({ hazardIds, categoryIds }: { hazardIds: string[]; categoryIds: string[] }) {
  return (
    <>
      {hazardIds.map((id) => (
        <Badge key={id} tone="warn">
          {hazardLabel(id)}
        </Badge>
      ))}
      {categoryIds.map((id) => (
        <Badge key={id} tone="info">
          {categoryLabel(id)}
        </Badge>
      ))}
    </>
  );
}

export function LawRow({ law }: { law: Law }) {
  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-surface text-primary">
          <LawIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-ink">{law.title}</p>
          <p className={`mt-0.5 ${META.base}`}>{law.reference}</p>
          <p className={`mt-2 ${BODY.base}`}>{law.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge icon={<MapPinIcon className="size-3.5" />}>
              {scopeLabel(law.scope)}
            </Badge>
            <TagBadges hazardIds={law.hazardIds} categoryIds={law.categoryIds} />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-surface-deep px-4 py-2 font-semibold text-primary transition-colors duration-300 hover:border-primary hover:bg-tint-mist"
      >
        <DownloadIcon className="size-4" />
        Open document
        <span className="sr-only"> - {law.title}</span>
      </button>
    </div>
  );
}

export function ToolRow({ tool }: { tool: Tool }) {
  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-surface text-primary">
          <ToolIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-ink">{tool.title}</p>
          <p className={`mt-2 ${BODY.base}`}>{tool.explanation}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <TagBadges hazardIds={tool.hazardIds} categoryIds={tool.categoryIds} />
          </div>
        </div>
      </div>

      {/* A tool's link leaves the platform (FR-STU-630) - "Open", never
          "Download", and no download icon, the same rule `<MaterialsList>`
          already applies to a `link`-kind material. */}
      <a
        href={tool.link}
        target="_blank"
        rel="noreferrer"
        className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-surface-deep px-4 py-2 font-semibold text-primary transition-colors duration-300 hover:border-primary hover:bg-tint-mist"
      >
        <LinkIcon className="size-4" />
        Open tool
        <span className="sr-only"> - {tool.title}</span>
      </a>
    </div>
  );
}
