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
 * One Law or one Tool, as a row or as a card - the Laws and Tools tabs' own
 * `<LawCard>`/`<ToolCard>` grid, and the Module/Lecture pages' "Related
 * laws"/"Related tools" sections, all read the same underlying fact set, so
 * both shapes live here rather than a card copy drifting from the row it
 * started as. A row is `<MaterialsList>`'s own shape (an icon standing for
 * what the row IS, the essential facts, one action on the end); a card is
 * the same facts on a `<LawExplorer>`/`<ToolExplorer>`-style tile. What
 * differs between Law and Tool either way is that a row/card carries TAGS -
 * a learner filtering by "Flooding" is reading the same badges
 * `<ReferenceFilter>`/`<LawExplorer>`/`<ToolExplorer>` filter against, so
 * each shows exactly what it can be found by.
 *
 * Two components per shape rather than one taking a union, because a Law's
 * province scope has no equivalent on a Tool (FR-STU-630 - a Tool is
 * deliberately province-agnostic) and a shared component would need a
 * branch for a field that only ever appears on one side of it.
 */

/** Exported for `<LawExplorer>`/`<ToolExplorer>` (the Laws/Tools tabs' own
 *  card grids), which draw the same hazard/category badges on a card rather
 *  than a row. */
export function TagBadges({ hazardIds, categoryIds }: { hazardIds: string[]; categoryIds: string[] }) {
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
          <p className={`measure-wide mt-2 ${BODY.base}`}>{law.summary}</p>
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
          <p className={`measure-wide mt-2 ${BODY.base}`}>{tool.explanation}</p>
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

export function LawCard({ law }: { law: Law }) {
  return (
    <div className="flex flex-col gap-4 rounded-sm border border-surface-deep bg-paper-raised p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-surface text-primary">
          <LawIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-snug text-ink">{law.title}</p>
          <p className={`mt-0.5 ${META.base}`}>{law.reference}</p>
        </div>
      </div>

      <p className={`${BODY.base} line-clamp-3`}>{law.summary}</p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <Badge icon={<MapPinIcon className="size-3.5" />}>{scopeLabel(law.scope)}</Badge>
        <TagBadges hazardIds={law.hazardIds} categoryIds={law.categoryIds} />
      </div>

      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-surface-deep px-4 py-2 text-sm font-semibold text-primary transition-colors duration-300 hover:border-primary hover:bg-tint-mist"
      >
        <DownloadIcon className="size-4" />
        Open document
        <span className="sr-only"> - {law.title}</span>
      </button>
    </div>
  );
}

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="flex flex-col gap-4 rounded-sm border border-surface-deep bg-paper-raised p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-surface text-primary">
          <ToolIcon className="size-5" />
        </span>
        <p className="min-w-0 font-display text-lg font-semibold leading-snug text-ink">
          {tool.title}
        </p>
      </div>

      <p className={`${BODY.base} line-clamp-3`}>{tool.explanation}</p>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <TagBadges hazardIds={tool.hazardIds} categoryIds={tool.categoryIds} />
      </div>

      {/* A tool's link leaves the platform (FR-STU-630) - "Open", never
          "Download", the same rule `<ToolRow>` already follows. */}
      <a
        href={tool.link}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-surface-deep px-4 py-2 text-sm font-semibold text-primary transition-colors duration-300 hover:border-primary hover:bg-tint-mist"
      >
        <LinkIcon className="size-4" />
        Open tool
        <span className="sr-only"> - {tool.title}</span>
      </a>
    </div>
  );
}
