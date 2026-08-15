import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import {
  catalogueProgramme,
  consoleModules,
  formatNumber,
  managedProgramme,
  programmesFor,
  quizStatsFor,
  reviewsForProgramme,
  staffById,
} from "@/lib/admin";
import { attachmentsFor } from "@/lib/materials";
import { formatDate, formatDateLong } from "@/lib/portal";
import {
  Badge,
  Callout,
  Cell,
  DefinitionList,
  MetricCard,
  NameCell,
  PageBody,
  PageHeader,
  Panel,
  Row,
  Section,
  TableFrame,
  type Column,
} from "@/components/console/ui";
import {
  MODULE_STATE_LABEL,
  MODULE_STATE_TONE,
} from "@/components/console/status";
import { ExternalIcon, StarFilledIcon } from "@/components/console/icons";
import { NewModuleAction } from "@/components/console/new-module-action";

type Params = { params: Promise<{ programmeId: string }> };

/**
 * Only the programmes this instructor is assigned to exist as routes.
 *
 * The alternative - generate every programme and check the assignment at
 * render - would build pages that exist only to say no. An instructor who
 * follows an old link to a programme they no longer write for gets a 404,
 * which is the honest answer: for them, that page is not there.
 */
export function generateStaticParams() {
  const member = staffById(SESSION.instructor);
  return (member?.programmeIds ?? []).map((programmeId) => ({ programmeId }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { programmeId } = await params;
  const programme = managedProgramme(programmeId);
  return { title: programme ? programme.title : "Programme not found" };
}

const COLUMNS: Column[] = [
  { key: "module", head: "Module" },
  { key: "state", head: "State" },
  { key: "materials", head: "Materials", numeric: true, hideBelow: "lg" },
  { key: "quiz", head: "Quiz", hideBelow: "md" },
  { key: "updated", head: "Last edited", numeric: true, hideBelow: "sm" },
  { key: "open", head: "", numeric: true },
];

export default async function InstructorProgrammePage({ params }: Params) {
  const { programmeId } = await params;
  const member = staffById(SESSION.instructor);
  if (!member) throw new Error("[instructor] no session account");

  const programme = managedProgramme(programmeId);
  const assigned = programmesFor(member).some(
    (entry) => entry.id === programmeId,
  );
  if (!programme || !assigned) notFound();

  const modules = consoleModules(programme.id);
  const published = reviewsForProgramme(programme.id).filter(
    (review) => review.status === "published",
  );
  const publicEntry = catalogueProgramme(programme.id);
  const outstanding = modules.filter((mod) => mod.state !== "published").length;
  // Modules are read in order and a new one always joins at the end, so its
  // number is simply the count so far plus one - never chosen by hand.
  const nextModuleNumber = String(modules.length + 1).padStart(2, "0");

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/instructor/programmes", label: "My programmes" }}
        eyebrow="Programme"
        title={programme.title}
        lead={publicEntry?.summary}
        meta={
          <>
            <Badge tone={programme.status === "draft" ? "neutral" : "done"}>
              {programme.status === "draft" ? "Draft" : "Published"}
            </Badge>
            <Badge>{programme.moduleCount} modules</Badge>
            <Badge>{programme.hours} hours of study</Badge>
          </>
        }
        actions={
          publicEntry ? (
            <Link
              href={`/programmes/${programme.id}`}
              className="btn-ripple btn-solid btn-sm"
            >
              <span aria-hidden="true" className="btn-wave" />
              <span className="btn-label">
                <ExternalIcon className="size-4" />
                View as a learner
              </span>
            </Link>
          ) : undefined
        }
      />

      {programme.status === "draft" ? (
        <div className={CONSOLE.stack}>
          <Callout tone="info" title="Not published">
            Nothing here is visible to a learner. When every module is written,
            ask an administrator to publish the programme - instructors write
            material, administrators decide what goes live.
          </Callout>
        </div>
      ) : null}

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Modules published"
          value={`${programme.publishedModules} of ${programme.moduleCount}`}
          hint={outstanding ? `${outstanding} still to finish` : "all written"}
        />
        <MetricCard
          label="Learners"
          value={programme.enrolments ? formatNumber(programme.enrolments) : "-"}
          hint={programme.status === "draft" ? "opens on publishing" : "enrolled"}
        />
        <MetricCard
          label="Average quiz score"
          value={programme.averageScore ? `${programme.averageScore}%` : "-"}
          hint="how well the material is landing"
        />
        <MetricCard
          label="Rating"
          value={programme.rating ? programme.rating.toFixed(1) : "-"}
          hint={
            programme.reviewCount
              ? `from ${programme.reviewCount} reviews`
              : "no reviews yet"
          }
        />
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-10 lg:col-span-2">
          <Section
            title="Modules"
            description="In the order a learner works through them."
            action={<NewModuleAction nextNumber={nextModuleNumber} />}
          >
            <TableFrame
              columns={COLUMNS}
              caption={`Modules in ${programme.title}`}
            >
              {modules.map((mod) => (
                <Row
                  key={mod.id}
                  href={`/instructor/programmes/${programme.id}/modules/${mod.id}`}
                >
                  <NameCell
                    href={`/instructor/programmes/${programme.id}/modules/${mod.id}`}
                    title={`${mod.number}. ${mod.title}`}
                  />
                  <Cell>
                    <Badge tone={MODULE_STATE_TONE[mod.state]}>
                      {MODULE_STATE_LABEL[mod.state]}
                    </Badge>
                  </Cell>
                  <Cell numeric hideBelow="lg">
                    {mod.hasContent
                      ? attachmentsFor(programme.id, mod.id).length
                      : "-"}
                  </Cell>
                  <Cell hideBelow="md">
                    {mod.hasContent ? (
                      <Link
                        href={`/instructor/programmes/${programme.id}/modules/${mod.id}/quiz`}
                        className="link-wipe text-primary"
                      >
                        {quizStatsFor(mod.id)
                          ? `${quizStatsFor(mod.id)?.passRate}% pass`
                          : "Manage"}
                      </Link>
                    ) : (
                      <span className="text-muted-light">-</span>
                    )}
                  </Cell>
                  <Cell numeric hideBelow="sm">
                    {mod.updatedOn ? formatDate(mod.updatedOn) : "-"}
                  </Cell>
                  <Cell numeric>
                    <Link
                      href={`/instructor/programmes/${programme.id}/modules/${mod.id}`}
                      className="link-wipe text-sm font-semibold text-primary"
                    >
                      {mod.hasContent ? "Edit" : "Start writing"}
                    </Link>
                  </Cell>
                </Row>
              ))}
            </TableFrame>
          </Section>

          <Section
            title="What learners said"
            description="Published reviews only. Anything still being moderated is not shown to instructors."
          >
            {published.length ? (
              <ul className="space-y-3">
                {published.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-sm border border-surface-deep bg-paper-raised px-5 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-ink">
                        {review.studentName}
                      </p>
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <StarFilledIcon
                            key={index}
                            className={`size-4 ${index < review.rating ? "text-accent" : "text-surface-deep"}`}
                          />
                        ))}
                        <span className="sr-only">{review.rating} out of 5</span>
                      </span>
                    </div>
                    <p className={`mt-2 ${BODY.base}`}>{review.body}</p>
                    <p className={`mt-2 ${META.base}`}>
                      {formatDate(review.submittedOn)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <Panel>
                <p className={BODY.base}>No published reviews yet.</p>
              </Panel>
            )}
          </Section>
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              About this programme
            </h2>
            <DefinitionList
              className="mt-5"
              items={[
                { term: "Level", value: programme.level },
                { term: "Study time", value: `${programme.hours} hours` },
                { term: "Modules", value: programme.moduleCount },
                { term: "Created", value: formatDateLong(programme.createdOn) },
                {
                  term: "Last updated",
                  value: formatDateLong(programme.updatedOn),
                },
              ]}
            />
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Materials
            </h2>
            <p className={`mt-3 ${BODY.base}`}>
              Handouts come off the shared library, so one file serves every
              module that needs it and is replaced once rather than six times.
            </p>
            <Link
              href="/instructor/materials"
              className="mt-4 inline-block text-lg font-semibold text-primary"
            >
              <span className="link-wipe">Open the library</span>
            </Link>
          </Panel>

          {publicEntry ? (
            <Panel>
              <h2 className="font-display text-2xl tracking-tight text-ink">
                What it promises
              </h2>
              <p className={`mt-3 ${BODY.base}`}>
                The catalogue tells learners this programme covers:
              </p>
              <ul className="mt-4 space-y-2.5">
                {publicEntry.topics.map((topic) => (
                  <li key={topic} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                    />
                    <span className={BODY.base}>{topic}</span>
                  </li>
                ))}
              </ul>
              <p className={`mt-4 ${META.base}`}>
                Worth reading before writing - it is the promise the material
                has to keep.
              </p>
            </Panel>
          ) : null}
        </aside>
      </div>
    </PageBody>
  );
}
