import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { MANAGED_MODULES } from "@/content/staff";
import {
  catalogueModule,
  consoleLectures,
  formatNumber,
  lecturersFor,
  managedModule,
  quizStatsFor,
  reviewsForModule,
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
  PrototypeNote,
  Row,
  Section,
  TableFrame,
  type Column,
} from "@/components/console/ui";
import { ConfirmAction, StateControl } from "@/components/console/actions";
import { RenameAction } from "@/components/console/rename-action";
import { IfCan, LockedNote } from "@/components/console/permission";
import {
  LECTURE_STATE_LABEL,
  LECTURE_STATE_TONE,
  MODULE_STATUS_LABEL,
  MODULE_STATUS_TONE,
} from "@/components/console/status";
import { ExternalIcon, StarFilledIcon } from "@/components/console/icons";

type Params = { params: Promise<{ moduleId: string }> };

export function generateStaticParams() {
  return MANAGED_MODULES.map((mdl) => ({ moduleId: mdl.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { moduleId } = await params;
  const mdl = managedModule(moduleId);
  return { title: mdl ? mdl.title : "Module not found" };
}

const LECTURE_COLUMNS: Column[] = [
  { key: "lecture", head: "Lecture" },
  { key: "state", head: "State" },
  { key: "author", head: "Author", hideBelow: "md" },
  { key: "materials", head: "Materials", numeric: true, hideBelow: "xl" },
  { key: "quiz", head: "Quiz", hideBelow: "lg" },
  { key: "updated", head: "Updated", numeric: true, hideBelow: "sm" },
  { key: "open", head: "", numeric: true },
];

/**
 * One module, from the inside.
 *
 * The lecture list IS the page. Everything else - enrolments, rating, the
 * settings panel - is context for the question this screen is opened with,
 * which is always some version of "what state is the material in".
 *
 * A DRAFT MODULE LOOKS DIFFERENT, not just differently labelled: it has no
 * enrolment figures to show, its lectures are a plan rather than content, and
 * the thing an administrator wants is the publish control. Showing zeroes
 * where the numbers go and calling it done would be a screen that reads as
 * broken.
 */
export default async function ModulePage({ params }: Params) {
  const { moduleId } = await params;
  const mdl = managedModule(moduleId);
  if (!mdl) notFound();

  const lectures = consoleLectures(mdl.id);
  const team = lecturersFor(mdl.id);
  const reviews = reviewsForModule(mdl.id);
  const pending = reviews.filter((review) => review.status === "pending").length;
  const isDraft = mdl.status === "draft";
  const publicEntry = catalogueModule(mdl.id);
  const completion = mdl.enrolments
    ? Math.round((mdl.completions / mdl.enrolments) * 100)
    : 0;

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/admin/modules", label: "Modules" }}
        eyebrow="Module"
        title={mdl.title}
        lead={publicEntry?.summary}
        meta={
          <>
            <Badge tone={MODULE_STATUS_TONE[mdl.status]}>
              {MODULE_STATUS_LABEL[mdl.status]}
            </Badge>
            <Badge>{mdl.level}</Badge>
            <Badge>{mdl.hours} hours</Badge>
            {mdl.rating ? (
              <Badge icon={<StarFilledIcon className="size-3.5 text-accent" />}>
                {mdl.rating.toFixed(1)} from {mdl.reviewCount} reviews
              </Badge>
            ) : null}
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

      {isDraft ? (
        <div className={CONSOLE.stack}>
          <Callout tone="info" title="This module is a draft">
            It does not appear in the catalogue, nobody can enrol, and its
            lectures are a plan rather than material. Publishing is in the panel
            on the right, and needs every lecture written first.
          </Callout>
        </div>
      ) : null}

      {!team.length ? (
        <div className={CONSOLE.stack}>
          <Callout title="No lecturer is assigned">
            Nobody can write or revise this module&rsquo;s lectures until
            somebody is.{" "}
            <Link href="/admin/lecturers" className="link-wipe font-semibold text-primary">
              Assign a lecturer
            </Link>
            .
          </Callout>
        </div>
      ) : null}

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Lectures written"
          value={`${mdl.publishedLectures} of ${mdl.lectureCount}`}
          hint={isDraft ? "none published yet" : "published to learners"}
        />
        <MetricCard
          label="Enrolments"
          value={mdl.enrolments ? formatNumber(mdl.enrolments) : "-"}
          hint={isDraft ? "opens on publishing" : "since the module opened"}
        />
        <MetricCard
          label="Completed"
          value={mdl.completions ? formatNumber(mdl.completions) : "-"}
          hint={mdl.enrolments ? `${completion}% of enrolments` : "-"}
        />
        <MetricCard
          label="Average quiz score"
          value={mdl.averageScore ? `${mdl.averageScore}%` : "-"}
          hint="across every attempt"
        />
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-10 lg:col-span-2">
          <Section
            title="Lectures"
            description={
              isDraft
                ? "The plan. Each of these becomes a lecture when its lecturer writes it."
                : "In the order a learner works through them."
            }
          >
            <TableFrame
              columns={LECTURE_COLUMNS}
              caption={`Lectures in ${mdl.title}`}
            >
              {lectures.map((mod) => (
                <Row
                  key={mod.id}
                  href={`/admin/modules/${mdl.id}/lectures/${mod.id}`}
                >
                  <NameCell
                    href={`/admin/modules/${mdl.id}/lectures/${mod.id}`}
                    title={`${mod.number}. ${mod.title}`}
                    subtitle={mod.hasContent ? undefined : "No content written yet"}
                  />
                  <Cell>
                    <Badge tone={LECTURE_STATE_TONE[mod.state]}>
                      {LECTURE_STATE_LABEL[mod.state]}
                    </Badge>
                  </Cell>
                  <Cell hideBelow="md">
                    {mod.author ? (
                      <Link
                        href={`/admin/lecturers/${mod.author.id}`}
                        className="link-wipe text-primary"
                      >
                        {mod.author.name}
                      </Link>
                    ) : (
                      <span className="text-muted-light">-</span>
                    )}
                  </Cell>
                  <Cell numeric hideBelow="xl">
                    {mod.hasContent
                      ? attachmentsFor(mdl.id, mod.id).length
                      : "-"}
                  </Cell>
                  <Cell hideBelow="lg">
                    {mod.hasContent ? (
                      <span className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/modules/${mdl.id}/lectures/${mod.id}/quiz`}
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
                </Row>
              ))}
            </TableFrame>
          </Section>

          <Section
            title="Reviews"
            description="What learners said about this module."
            action={
              <Link
                href="/admin/reviews"
                className="link-wipe text-lg font-semibold text-primary"
              >
                Moderation queue
              </Link>
            }
          >
            {reviews.length ? (
              <ul className="space-y-3">
                {reviews.slice(0, 4).map((review) => (
                  <li
                    key={review.id}
                    className="rounded-sm border border-surface-deep bg-paper-raised px-5 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-ink">
                        {review.studentName}
                      </p>
                      <span className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <StarFilledIcon
                            key={index}
                            className={`size-4 ${index < review.rating
                                ? "text-accent"
                                : "text-surface-deep"
                              }`}
                          />
                        ))}
                        <span className="sr-only">
                          {review.rating} out of 5
                        </span>
                      </span>
                    </div>
                    <p className={`mt-2 ${BODY.base}`}>{review.body}</p>
                    <p className={`mt-2 ${META.base}`}>
                      {formatDate(review.submittedOn)} ·{" "}
                      {review.status === "pending"
                        ? "waiting for moderation"
                        : review.status}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`rounded-sm border border-dashed border-muted-light bg-paper-raised px-6 py-10 text-center ${BODY.base}`}>
                No reviews yet.
              </p>
            )}
          </Section>
        </div>

        {/* ------------------------------------------------------- sidebar */}
        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Publication
            </h2>
            <p className={`mt-2 ${BODY.base}`}>
              A published module appears in the catalogue and accepts
              enrolments.
            </p>

            <div className="mt-6">
              <IfCan
                capability="manageModules"
                fallback={<LockedNote capability="manageModules" />}
              >
                <StateControl
                  subject="this module"
                  current={mdl.status}
                  states={[
                    {
                      value: "published",
                      label: "Published",
                      description:
                        "In the catalogue, open to enrolment, visible to search engines.",
                    },
                    {
                      value: "draft",
                      label: "Draft",
                      description:
                        "Hidden. Learners already enrolled keep their access and their progress.",
                    },
                  ]}
                />
              </IfCan>
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Lecturers
            </h2>
            {team.length ? (
              <ul className="mt-5 space-y-3">
                {team.map((member) => (
                  <li key={member.id}>
                    <Link
                      href={`/admin/lecturers/${member.id}`}
                      className="flex items-center gap-3"
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-10 shrink-0 place-items-center rounded-full bg-tint-mist font-display text-sm font-bold tracking-tight text-primary"
                      >
                        {member.initials}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-lg font-semibold text-ink">
                          <span className="link-wipe">{member.name}</span>
                        </span>
                        <span className={`block truncate ${META.base}`}>
                          {member.title}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`mt-4 ${BODY.base}`}>Nobody yet.</p>
            )}
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Facts
            </h2>
            <DefinitionList
              className="mt-5"
              items={[
                { term: "Created", value: formatDateLong(mdl.createdOn) },
                { term: "Last updated", value: formatDateLong(mdl.updatedOn) },
                { term: "Level", value: mdl.level },
                { term: "Study time", value: `${mdl.hours} hours` },
                {
                  term: "Reviews waiting",
                  value: pending ? `${pending}` : "None",
                },
                { term: "Identifier", value: mdl.id },
              ]}
            />
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Materials
            </h2>
            <p className={`mt-2 ${BODY.base}`}>
              Handouts on this module come off the shared library, so a file
              used by six lectures is replaced once rather than six times.
            </p>
            <Link
              href="/admin/materials"
              className="mt-4 inline-block text-lg font-semibold text-primary"
            >
              <span className="link-wipe">Open the library</span>
            </Link>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Withdraw
            </h2>
            <p className={`mt-2 ${BODY.base}`}>
              Archiving hides a module from the catalogue permanently.
              Certificates already issued stay valid - they record what somebody
              did, and that does not stop being true.
            </p>
            <div className="mt-6">
              <IfCan
                capability="manageModules"
                fallback={<LockedNote capability="manageModules" />}
              >
                <ConfirmAction
                  label="Archive this module"
                  question={`Archive ${mdl.title}?`}
                  detail={`${mdl.enrolments ? formatNumber(mdl.enrolments) : "No"} learners have enrolled. They keep their progress and their certificates; nobody new can enrol.`}
                  confirmLabel="Archive it"
                  done="Prototype - the module is unchanged."
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
