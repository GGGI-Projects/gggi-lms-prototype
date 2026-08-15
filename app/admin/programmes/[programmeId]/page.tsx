import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { MANAGED_PROGRAMMES } from "@/content/staff";
import {
  catalogueProgramme,
  consoleModules,
  formatNumber,
  instructorsFor,
  managedProgramme,
  quizStatsFor,
  reviewsForProgramme,
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
  PrototypeNote,
  Row,
  Section,
  TableFrame,
  type Column,
} from "@/components/console/ui";
import { ConfirmAction, StateControl } from "@/components/console/actions";
import { IfCan, LockedNote } from "@/components/console/permission";
import {
  MODULE_STATE_LABEL,
  MODULE_STATE_TONE,
  PROGRAMME_STATUS_LABEL,
  PROGRAMME_STATUS_TONE,
} from "@/components/console/status";
import { ExternalIcon, StarFilledIcon } from "@/components/console/icons";

type Params = { params: Promise<{ programmeId: string }> };

export function generateStaticParams() {
  return MANAGED_PROGRAMMES.map((programme) => ({ programmeId: programme.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { programmeId } = await params;
  const programme = managedProgramme(programmeId);
  return { title: programme ? programme.title : "Programme not found" };
}

const MODULE_COLUMNS: Column[] = [
  { key: "module", head: "Module" },
  { key: "state", head: "State" },
  { key: "author", head: "Author", hideBelow: "md" },
  { key: "materials", head: "Materials", numeric: true, hideBelow: "xl" },
  { key: "quiz", head: "Quiz", hideBelow: "lg" },
  { key: "updated", head: "Updated", numeric: true, hideBelow: "sm" },
  { key: "open", head: "", numeric: true },
];

/**
 * One programme, from the inside.
 *
 * The module list IS the page. Everything else - enrolments, rating, the
 * settings panel - is context for the question this screen is opened with,
 * which is always some version of "what state is the material in".
 *
 * A DRAFT PROGRAMME LOOKS DIFFERENT, not just differently labelled: it has no
 * enrolment figures to show, its modules are a plan rather than content, and
 * the thing an administrator wants is the publish control. Showing zeroes
 * where the numbers go and calling it done would be a screen that reads as
 * broken.
 */
export default async function ProgrammePage({ params }: Params) {
  const { programmeId } = await params;
  const programme = managedProgramme(programmeId);
  if (!programme) notFound();

  const modules = consoleModules(programme.id);
  const team = instructorsFor(programme.id);
  const reviews = reviewsForProgramme(programme.id);
  const pending = reviews.filter((review) => review.status === "pending").length;
  const isDraft = programme.status === "draft";
  const publicEntry = catalogueProgramme(programme.id);
  const completion = programme.enrolments
    ? Math.round((programme.completions / programme.enrolments) * 100)
    : 0;

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/admin/programmes", label: "Programmes" }}
        eyebrow="Programme"
        title={programme.title}
        lead={publicEntry?.summary}
        meta={
          <>
            <Badge tone={PROGRAMME_STATUS_TONE[programme.status]}>
              {PROGRAMME_STATUS_LABEL[programme.status]}
            </Badge>
            <Badge>{programme.level}</Badge>
            <Badge>{programme.hours} hours</Badge>
            {programme.rating ? (
              <Badge icon={<StarFilledIcon className="size-3.5 text-accent" />}>
                {programme.rating.toFixed(1)} from {programme.reviewCount} reviews
              </Badge>
            ) : null}
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

      {isDraft ? (
        <div className={CONSOLE.stack}>
          <Callout tone="info" title="This programme is a draft">
            It does not appear in the catalogue, nobody can enrol, and its
            modules are a plan rather than material. Publishing is in the panel
            on the right, and needs every module written first.
          </Callout>
        </div>
      ) : null}

      {!team.length ? (
        <div className={CONSOLE.stack}>
          <Callout title="No instructor is assigned">
            Nobody can write or revise this programme&rsquo;s modules until
            somebody is.{" "}
            <Link href="/admin/instructors" className="link-wipe font-semibold text-primary">
              Assign an instructor
            </Link>
            .
          </Callout>
        </div>
      ) : null}

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Modules written"
          value={`${programme.publishedModules} of ${programme.moduleCount}`}
          hint={isDraft ? "none published yet" : "published to learners"}
        />
        <MetricCard
          label="Enrolments"
          value={programme.enrolments ? formatNumber(programme.enrolments) : "-"}
          hint={isDraft ? "opens on publishing" : "since the programme opened"}
        />
        <MetricCard
          label="Completed"
          value={programme.completions ? formatNumber(programme.completions) : "-"}
          hint={programme.enrolments ? `${completion}% of enrolments` : "-"}
        />
        <MetricCard
          label="Average quiz score"
          value={programme.averageScore ? `${programme.averageScore}%` : "-"}
          hint="across every attempt"
        />
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-10 lg:col-span-2">
          <Section
            title="Modules"
            description={
              isDraft
                ? "The plan. Each of these becomes a module when its instructor writes it."
                : "In the order a learner works through them."
            }
          >
            <TableFrame
              columns={MODULE_COLUMNS}
              caption={`Modules in ${programme.title}`}
            >
              {modules.map((mod) => (
                <Row
                  key={mod.id}
                  href={`/admin/programmes/${programme.id}/modules/${mod.id}`}
                >
                  <NameCell
                    href={`/admin/programmes/${programme.id}/modules/${mod.id}`}
                    title={`${mod.number}. ${mod.title}`}
                    subtitle={mod.hasContent ? undefined : "No content written yet"}
                  />
                  <Cell>
                    <Badge tone={MODULE_STATE_TONE[mod.state]}>
                      {MODULE_STATE_LABEL[mod.state]}
                    </Badge>
                  </Cell>
                  <Cell hideBelow="md">
                    {mod.author ? (
                      <Link
                        href={`/admin/instructors/${mod.author.id}`}
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
                      ? attachmentsFor(programme.id, mod.id).length
                      : "-"}
                  </Cell>
                  <Cell hideBelow="lg">
                    {mod.hasContent ? (
                      <Link
                        href={`/admin/programmes/${programme.id}/modules/${mod.id}/quiz`}
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
                </Row>
              ))}
            </TableFrame>
          </Section>

          <Section
            title="Reviews"
            description="What learners said about this programme."
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
              A published programme appears in the catalogue and accepts
              enrolments.
            </p>

            <div className="mt-6">
              <IfCan
                capability="manageProgrammes"
                fallback={<LockedNote capability="manageProgrammes" />}
              >
                <StateControl
                  subject="this programme"
                  current={programme.status}
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
              Instructors
            </h2>
            {team.length ? (
              <ul className="mt-5 space-y-3">
                {team.map((member) => (
                  <li key={member.id}>
                    <Link
                      href={`/admin/instructors/${member.id}`}
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
                { term: "Created", value: formatDateLong(programme.createdOn) },
                { term: "Last updated", value: formatDateLong(programme.updatedOn) },
                { term: "Level", value: programme.level },
                { term: "Study time", value: `${programme.hours} hours` },
                {
                  term: "Reviews waiting",
                  value: pending ? `${pending}` : "None",
                },
                { term: "Identifier", value: programme.id },
              ]}
            />
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Materials
            </h2>
            <p className={`mt-2 ${BODY.base}`}>
              Handouts on this programme come off the shared library, so a file
              used by six modules is replaced once rather than six times.
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
              Archiving hides a programme from the catalogue permanently.
              Certificates already issued stay valid - they record what somebody
              did, and that does not stop being true.
            </p>
            <div className="mt-6">
              <IfCan
                capability="manageProgrammes"
                fallback={<LockedNote capability="manageProgrammes" />}
              >
                <ConfirmAction
                  label="Archive this programme"
                  question={`Archive ${programme.title}?`}
                  detail={`${programme.enrolments ? formatNumber(programme.enrolments) : "No"} learners have enrolled. They keep their progress and their certificates; nobody new can enrol.`}
                  confirmLabel="Archive it"
                  done="Prototype - the programme is unchanged."
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
