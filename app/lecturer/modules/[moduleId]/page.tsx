import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import {
  catalogueModule,
  consoleLectures,
  formatNumber,
  managedModule,
  modulesFor,
  quizStatsFor,
  reviewsForModule,
  staffById,
} from "@/lib/admin";
import { attachmentsFor } from "@/lib/materials";
import { formatDate, formatDateLong, hasWrittenQuestions } from "@/lib/portal";
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
  LECTURE_STATE_LABEL,
  LECTURE_STATE_TONE,
} from "@/components/console/status";
import { EditIcon, ExternalIcon, StarFilledIcon } from "@/components/console/icons";
import { NewLectureAction } from "@/components/console/new-lecture-action";
import { RenameAction } from "@/components/console/rename-action";

type Params = { params: Promise<{ moduleId: string }> };

/**
 * Only the modules this lecturer is assigned to exist as routes.
 *
 * The alternative - generate every module and check the assignment at
 * render - would build pages that exist only to say no. A lecturer who
 * follows an old link to a module they no longer write for gets a 404,
 * which is the honest answer: for them, that page is not there.
 */
export function generateStaticParams() {
  const member = staffById(SESSION.lecturer);
  return (member?.moduleIds ?? []).map((moduleId) => ({ moduleId }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { moduleId } = await params;
  const mdl = managedModule(moduleId);
  return { title: mdl ? mdl.title : "Module not found" };
}

const COLUMNS: Column[] = [
  { key: "lecture", head: "Lecture" },
  { key: "state", head: "State" },
  { key: "materials", head: "Materials", numeric: true, hideBelow: "lg" },
  { key: "quiz", head: "Quiz", hideBelow: "md" },
  { key: "updated", head: "Last edited", numeric: true, hideBelow: "sm" },
  { key: "open", head: "", numeric: true },
];

export default async function LecturerModulePage({ params }: Params) {
  const { moduleId } = await params;
  const member = staffById(SESSION.lecturer);
  if (!member) throw new Error("[lecturer] no session account");

  const mdl = managedModule(moduleId);
  const assigned = modulesFor(member).some(
    (entry) => entry.id === moduleId,
  );
  if (!mdl || !assigned) notFound();

  const lectures = consoleLectures(mdl.id);
  const published = reviewsForModule(mdl.id).filter(
    (review) => review.status === "published",
  );
  const publicEntry = catalogueModule(mdl.id);
  const outstanding = lectures.filter((mod) => mod.state !== "published").length;
  // Lectures are read in order and a new one always joins at the end, so its
  // number is simply the count so far plus one - never chosen by hand.
  const nextLectureNumber = String(lectures.length + 1).padStart(2, "0");

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/lecturer/modules", label: "My modules" }}
        eyebrow="Module"
        title={mdl.title}
        lead={publicEntry?.summary}
        meta={
          <>
            <Badge tone={mdl.status === "draft" ? "neutral" : "done"}>
              {mdl.status === "draft" ? "Draft" : "Published"}
            </Badge>
            <Badge>{mdl.lectureCount} lectures</Badge>
            <Badge>{mdl.hours} hours of study</Badge>
          </>
        }
        actions={
          <>
            <RenameAction
              subject="module"
              title={mdl.title}
              capability="manageModules"
            />
            {publicEntry ? (
              <Link
                href={`/modules/${mdl.id}`}
                className="btn-ripple btn-solid btn-sm"
              >
                <span aria-hidden="true" className="btn-wave" />
                <span className="btn-label">
                  <ExternalIcon className="size-4" />
                  View as a learner
                </span>
              </Link>
            ) : null}
          </>
        }
      />

      {mdl.status === "draft" ? (
        <div className={CONSOLE.stack}>
          <Callout tone="info" title="Not published">
            Nothing here is visible to a learner. When every lecture is written,
            ask an administrator to publish the module - lecturers write
            material, administrators decide what goes live.
          </Callout>
        </div>
      ) : null}

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Lectures published"
          value={`${mdl.publishedLectures} of ${mdl.lectureCount}`}
          hint={outstanding ? `${outstanding} still to finish` : "all written"}
        />
        <MetricCard
          label="Learners"
          value={mdl.enrolments ? formatNumber(mdl.enrolments) : "-"}
          hint={mdl.status === "draft" ? "opens on publishing" : "enrolled"}
        />
        <MetricCard
          label="Average quiz score"
          value={mdl.averageScore ? `${mdl.averageScore}%` : "-"}
          hint="how well the material is landing"
        />
        <MetricCard
          label="Rating"
          value={mdl.rating ? mdl.rating.toFixed(1) : "-"}
          hint={
            mdl.reviewCount
              ? `from ${mdl.reviewCount} reviews`
              : "no reviews yet"
          }
        />
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-10 lg:col-span-2">
          <Section
            title="Lectures"
            description="In the order a learner works through them."
            action={<NewLectureAction nextNumber={nextLectureNumber} />}
          >
            <TableFrame
              columns={COLUMNS}
              caption={`Lectures in ${mdl.title}`}
            >
              {lectures.map((mod) => (
                <Row
                  key={mod.id}
                  href={`/lecturer/modules/${mdl.id}/lectures/${mod.id}`}
                >
                  <NameCell
                    href={`/lecturer/modules/${mdl.id}/lectures/${mod.id}`}
                    title={`${mod.number}. ${mod.title}`}
                  />
                  <Cell>
                    <Badge tone={LECTURE_STATE_TONE[mod.state]}>
                      {LECTURE_STATE_LABEL[mod.state]}
                    </Badge>
                  </Cell>
                  <Cell numeric hideBelow="lg">
                    {mod.hasContent
                      ? attachmentsFor(mdl.id, mod.id).length
                      : "-"}
                  </Cell>
                  <Cell hideBelow="md">
                    {mod.hasContent ? (
                      <span className="inline-flex items-center gap-2">
                        <Link
                          href={`/lecturer/modules/${mdl.id}/lectures/${mod.id}/quiz`}
                          className="link-wipe text-primary"
                        >
                          {quizStatsFor(mod.id)
                            ? `${quizStatsFor(mod.id)?.passRate}% pass`
                            : "Manage"}
                        </Link>
                        {hasWrittenQuestions(mod.id) ? (
                          <Badge tone="active">+ written</Badge>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-muted-light">-</span>
                    )}
                  </Cell>
                  <Cell numeric hideBelow="sm">
                    {mod.updatedOn ? formatDate(mod.updatedOn) : "-"}
                  </Cell>
                  <Cell numeric>
                    <Link
                      href={`/lecturer/modules/${mdl.id}/lectures/${mod.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                    >
                      {mod.hasContent ? <EditIcon className="size-4" /> : null}
                      <span className="link-wipe">
                        {mod.hasContent ? "Edit" : "Start writing"}
                      </span>
                    </Link>
                  </Cell>
                </Row>
              ))}
            </TableFrame>
          </Section>

          <Section
            title="What learners said"
            description="Published reviews only. Anything still being moderated is not shown to lecturers."
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
              About this module
            </h2>
            <DefinitionList
              className="mt-5"
              items={[
                { term: "Level", value: mdl.level },
                { term: "Study time", value: `${mdl.hours} hours` },
                { term: "Lectures", value: mdl.lectureCount },
                { term: "Created", value: formatDateLong(mdl.createdOn) },
                {
                  term: "Last updated",
                  value: formatDateLong(mdl.updatedOn),
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
              lecture that needs it and is replaced once rather than six times.
            </p>
            <Link
              href="/lecturer/materials"
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
                The catalogue tells learners this module covers:
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
