/**
 * The Law library's two screens: the list, and one Law on its own.
 *
 * ADMIN ONLY, unlike the Materials Library - there is no `/lecturer/laws`,
 * because writing a lecture and administering the Law library are
 * different jobs (see docs/SRS.md §4.30). That is also why this file, unlike
 * `materials-page.tsx`, takes no `area` prop: there is only one place this
 * screen lives.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { CONSOLE } from "@/lib/theme";
import { staffById } from "@/lib/admin";
import {
  lawById,
  lawsWithUsage,
  lawTagLabels,
  lawTotals,
  moduleUsageOfLaw,
  scopeLabel,
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
import { AddLawAction, EditLawAction } from "@/components/console/law-actions";
import { LawShelf, type LawShelfEntry } from "@/components/console/law-shelf";
import { IfCan, LockedNote } from "@/components/console/permission";

const STATUS_LABEL = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
} as const;

/* ----------------------------------------------------------------- library */

export function LawsLibrary() {
  const totals = lawTotals();
  const entries = lawsWithUsage();

  const shelf: LawShelfEntry[] = entries.map(({ law, usage }) => ({
    id: law.id,
    title: law.title,
    summary: law.summary,
    reference: law.reference,
    scope: scopeLabel(law.scope),
    status: law.status,
    hazardIds: law.hazardIds,
    categoryIds: law.categoryIds,
    moduleCount: usage.length,
  }));

  return (
    <PageBody>
      <PageHeader
        eyebrow="Learning"
        title="Laws"
        lead="One library for the whole platform, tagged the same way a Module is. A Law relates to a Module automatically the moment they share a hazard or category tag - there is nothing to link by hand (see BR-26)."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Laws" value={totals.total} hint="in the library" />
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
        title="Every law"
        description="Search matches the title, reference and summary."
        action={<AddLawAction />}
        className={CONSOLE.stack}
      >
        <LawShelf entries={shelf} />
      </Section>

      <PrototypeNote className="mt-6">
        No document is stored and nothing downloads. The library&rsquo;s
        structure - tags, status, which modules relate to it - is real; the
        files behind it are not.
      </PrototypeNote>
    </PageBody>
  );
}

/* --------------------------------------------------------------- one law */

export function LawDetail({ lawId }: { lawId: string }) {
  const law = lawById(lawId);
  if (!law) notFound();

  const usage = moduleUsageOfLaw(law);
  const tags = lawTagLabels(law);
  const addedBy = staffById(law.addedBy);

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/laws-admin", label: "Laws" }}
        eyebrow={law.reference}
        title={law.title}
        lead={law.summary}
        meta={
          <>
            <Badge
              tone={
                law.status === "published"
                  ? "done"
                  : law.status === "draft"
                    ? "neutral"
                    : "warn"
              }
            >
              {STATUS_LABEL[law.status]}
            </Badge>
            <Badge>{scopeLabel(law.scope)}</Badge>
          </>
        }
        actions={<EditLawAction law={law} />}
      />

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-10 lg:col-span-2">
          <Section
            title="Related modules"
            description="Found automatically by shared tag, never linked by hand - the same rule §4.30 sets for this whole library."
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
                Give this law a hazard or category tag that a module also
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
                No hazard or category tag yet - this law cannot relate to any
                module until it has at least one.
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
              A published law appears on a learner&rsquo;s Laws tab, and on
              any module it relates to.
            </p>
            <div className="mt-6">
              <IfCan capability="manageLaws" fallback={<LockedNote capability="manageLaws" />}>
                <StateControl
                  subject="this law"
                  current={law.status}
                  disabled={law.status === "archived"}
                  disabledNote="An archived law is restored by editing it, not from here."
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
                { term: "Reference", value: law.reference },
                { term: "Applies to", value: scopeLabel(law.scope) },
                { term: "Published", value: formatDateLong(law.publishedOn) },
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
                { term: "Identifier", value: law.id },
              ]}
            />
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">Archive</h2>
            <p className="mt-2 text-lg text-ink-soft">
              Archiving hides this law from the library and from every module
              it related to. It keeps the record - anything that already
              cited it stays true.
            </p>
            <div className="mt-6">
              <IfCan capability="manageLaws" fallback={<LockedNote capability="manageLaws" />}>
                <ConfirmAction
                  label="Archive this law"
                  question={`Archive ${law.title}?`}
                  detail={
                    usage.length
                      ? `It currently relates to ${usage.length} ${usage.length === 1 ? "module" : "modules"}. Archiving removes it from all of them; nothing already certified changes.`
                      : "It is not currently related to any module."
                  }
                  confirmLabel="Archive it"
                  done="Prototype - the law is unchanged."
                  disabled={law.status === "archived"}
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
