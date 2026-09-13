/**
 * The Tool directory's two screens: the list, and one Tool on its own.
 *
 * SAME SHAPE AS `laws-page.tsx` - see the note there for why this is
 * admin-only with no `area` prop. What differs: a Tool has a link instead of
 * a reference, no province scope, and its "how to use it" explanation
 * stands in for a Law's summary.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { CONSOLE } from "@/lib/theme";
import { staffById } from "@/lib/admin";
import {
  toolById,
  toolsWithUsage,
  toolTagLabels,
  toolTotals,
  moduleUsageOfTool,
} from "@/lib/laws-tools";
import { formatDateLong } from "@/lib/portal";
import {
  Badge,
  Callout,
  DefinitionList,
  MetricCard,
  PageBody,
  PageHeader,
  Panel,
  PersonTag,
  PrototypeNote,
  Section,
} from "@/components/console/ui";
import { ConfirmAction, StateControl } from "@/components/console/actions";
import { AddToolAction, EditToolAction } from "@/components/console/tool-actions";
import { ToolShelf, type ToolShelfEntry } from "@/components/console/tool-shelf";
import { IfCan, LockedNote } from "@/components/console/permission";
import { ExternalIcon } from "@/components/console/icons";

const STATUS_LABEL = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
} as const;

/* --------------------------------------------------------------- directory */

export function ToolsDirectory() {
  const totals = toolTotals();
  const entries = toolsWithUsage();

  const shelf: ToolShelfEntry[] = entries.map(({ tool, usage }) => ({
    id: tool.id,
    title: tool.title,
    explanation: tool.explanation,
    link: tool.link,
    status: tool.status,
    tags: toolTagLabels(tool),
    moduleCount: usage.length,
  }));

  return (
    <PageBody>
      <PageHeader
        eyebrow="Learning"
        title="Tools"
        lead="A link and a plain explanation of how to use it, per tool - tagged the same way a Module and a Law are. Opening one leaves the platform; this directory's job is to keep the link and the explanation current, not to host what it points to (see FR-STU-630)."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Tools" value={totals.total} hint="in the directory" />
        <MetricCard
          label="Published"
          value={totals.published}
          hint="visible to learners"
        />
        <MetricCard label="Draft" value={totals.draft} hint="not published yet" />
        <MetricCard
          label="Not on a module"
          value={totals.unrelated}
          hint="shares no tag with anything yet"
          goodWhen="down"
        />
      </div>

      <Section
        title="Every tool"
        description="Search matches the title and the explanation."
        action={<AddToolAction />}
        className={CONSOLE.stack}
      >
        <ToolShelf entries={shelf} />
      </Section>

      <PrototypeNote className="mt-6">
        No link is checked and nothing here is actually reachable. The
        directory&rsquo;s structure - tags, status, which modules relate to
        it - is real; the outside resource itself is not.
      </PrototypeNote>
    </PageBody>
  );
}

/* --------------------------------------------------------------- one tool */

export function ToolDetail({ toolId }: { toolId: string }) {
  const tool = toolById(toolId);
  if (!tool) notFound();

  const usage = moduleUsageOfTool(tool);
  const tags = toolTagLabels(tool);
  const addedBy = staffById(tool.addedBy);

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/tools-admin", label: "Tools" }}
        eyebrow="Tool"
        title={tool.title}
        lead={tool.explanation}
        meta={
          <>
            <Badge
              tone={
                tool.status === "published"
                  ? "done"
                  : tool.status === "draft"
                    ? "neutral"
                    : "warn"
              }
            >
              {STATUS_LABEL[tool.status]}
            </Badge>
          </>
        }
        actions={<EditToolAction tool={tool} />}
      />

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-10 lg:col-span-2">
          <Section
            title="Related modules"
            description="Found automatically by shared tag, never linked by hand - the same rule §4.31 sets for this whole directory."
          >
            {usage.length ? (
              <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
                {usage.map((entry) => (
                  <li key={entry.moduleId} className="px-5 py-3.5">
                    <Link
                      href={`/admin/modules/${entry.moduleId}`}
                      className="text-lg font-semibold text-ink"
                    >
                      <span className="link-wipe">{entry.moduleTitle}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Callout tone="info" title="Not related to any module yet">
                Give this tool a hazard or category tag that a module also
                carries, and it will appear there automatically.
              </Callout>
            )}
          </Section>

          <Section title="Tags">
            {tags.length ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-surface-deep bg-paper-raised px-3 py-1 text-sm text-ink-soft"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-lg text-muted">
                No hazard or category tag yet - this tool cannot relate to
                any module until it has at least one.
              </p>
            )}
          </Section>
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Publication
            </h2>
            <p className="mt-2 text-lg text-ink-soft">
              A published tool appears on a learner&rsquo;s Tools tab, and on
              any module it relates to.
            </p>
            <div className="mt-6">
              <IfCan capability="manageTools" fallback={<LockedNote capability="manageTools" />}>
                <StateControl
                  subject="this tool"
                  current={tool.status}
                  disabled={tool.status === "archived"}
                  disabledNote="An archived tool is restored by editing it, not from here."
                  states={[
                    {
                      value: "published",
                      label: "Published",
                      description: "Visible to every learner, and to any module it relates to.",
                    },
                    {
                      value: "draft",
                      label: "Draft",
                      description: "Being written. Nobody outside this console sees it.",
                    },
                  ]}
                />
              </IfCan>
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">Facts</h2>
            <DefinitionList
              className="mt-5"
              items={[
                {
                  term: "Link",
                  value: (
                    <span className="inline-flex items-center gap-1.5 break-all">
                      <ExternalIcon className="size-4 shrink-0" />
                      {tool.link}
                    </span>
                  ),
                },
                { term: "Published", value: formatDateLong(tool.publishedOn) },
                {
                  term: "Added by",
                  value: addedBy ? (
                    <PersonTag
                      name={addedBy.name}
                      avatarUrl={addedBy.avatarUrl}
                      initials={addedBy.initials}
                      size="xs"
                    />
                  ) : (
                    "Unknown"
                  ),
                },
                { term: "Identifier", value: tool.id },
              ]}
            />
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">Archive</h2>
            <p className="mt-2 text-lg text-ink-soft">
              Archiving hides this tool from the directory and from every
              module it related to. It keeps the record - anything that
              already pointed learners at it stays true.
            </p>
            <div className="mt-6">
              <IfCan capability="manageTools" fallback={<LockedNote capability="manageTools" />}>
                <ConfirmAction
                  label="Archive this tool"
                  question={`Archive ${tool.title}?`}
                  detail={
                    usage.length
                      ? `It currently relates to ${usage.length} ${usage.length === 1 ? "module" : "modules"}. Archiving removes it from all of them.`
                      : "It is not currently related to any module."
                  }
                  confirmLabel="Archive it"
                  done="Prototype - the tool is unchanged."
                  disabled={tool.status === "archived"}
                  disabledNote="Already archived."
                />
              </IfCan>
            </div>
            <PrototypeNote className="mt-6" />
          </Panel>
        </aside>
      </div>
    </PageBody>
  );
}
