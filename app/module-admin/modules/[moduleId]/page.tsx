import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import {
  catalogueModule,
  certificateRegister,
  consoleLectures,
  lecturers,
  lecturersFor,
  modulesFor,
  quizStatsFor,
  reviewsForModule,
  staffById,
  studentById,
} from "@/lib/admin";
import { attachmentsFor } from "@/lib/materials";
import { formatDate, formatDateLong, hasBlankQuestions } from "@/lib/portal";
import { categoryLabel, hazardLabel } from "@/content/tags";
import {
  Avatar,
  Badge,
  Callout,
  Cell,
  DefinitionList,
  MetricCard,
  PageBody,
  PageHeader,
  Panel,
  PersonTag,
  PrototypeNote,
  Row,
  Section,
  TableFrame,
  type Column,
} from "@/components/console/ui";
import { ConfirmAction, StateControl } from "@/components/console/actions";
import { RenameAction } from "@/components/console/rename-action";
import { AssignModuleLecturers } from "@/components/console/assign-lecturers-action";
import { NewLecturerAction } from "@/components/console/new-lecturer-action";
import { EditModuleDetails } from "@/components/console/module-details-action";
import { IfCan, LockedNote } from "@/components/console/permission";
import {
  LECTURE_STATE_LABEL,
  LECTURE_STATE_TONE,
  MODULE_STATUS_LABEL,
  MODULE_STATUS_TONE,
} from "@/components/console/status";
import { StarFilledIcon } from "@/components/console/icons";

type Params = { params: Promise<{ moduleId: string }> };

function moduleAdmin() {
  const member = staffById(SESSION["module-admin"]);
  if (!member) throw new Error("[module-admin] no session account");
  return member;
}

export function generateStaticParams() {
  return modulesFor(moduleAdmin()).map((mdl) => ({ moduleId: mdl.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { moduleId } = await params;
  const mdl = modulesFor(moduleAdmin()).find((entry) => entry.id === moduleId);
  return { title: mdl ? mdl.title : "Module not found" };
}

/**
 * One module, from its own Module Administrator's side.
 *
 * THE SAME PAGE AS `/admin/modules/[moduleId]`, SCOPED - same lecture table,
 * same publish/archive controls, same lecturer roster, plus the one thing
 * that page never needed: an "Invite a lecturer" action, since a Module
 * Administrator has no `/admin/lecturers` of their own to reach one from
 * (FR-MODADM-050). `notFound()` fires for a module outside this account's own
 * `moduleIds` even though `generateStaticParams` already only ever builds
 * those ids - the same defensive re-check `/registrar/learners/[studentId]`
 * already applies to its own province.
 */
export default async function ModuleAdminModulePage({ params }: Params) {
  const { moduleId } = await params;
  const member = moduleAdmin();
  const mdl = modulesFor(member).find((entry) => entry.id === moduleId);
  if (!mdl) notFound();

  const lectures = consoleLectures(mdl.id);
  const team = lecturersFor(mdl.id);
  const reviews = reviewsForModule(mdl.id);
  const pending = reviews.filter((review) => review.status === "pending").length;
  const isDraft = mdl.status === "draft";
  const publicEntry = catalogueModule(mdl.id);
  const certificates = certificateRegister().filter(
    (record) => record.moduleId === mdl.id,
  );
  const completion = mdl.enrolments
    ? Math.round((mdl.completions / mdl.enrolments) * 100)
    : 0;

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/module-admin/modules", label: "My modules" }}
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
          <RenameAction
            subject="module"
            title={mdl.title}
            capability="manageModuleDetails"
          />
        }
      />

      {isDraft ? (
        <div className={CONSOLE.stack}>
          <Callout tone="info" title="This module is a draft">
            It does not appear in the catalogue, nobody can enrol, and its
            lectures are a plan rather than material. Publishing is in the
            panel on the right, and needs every lecture written first.
          </Callout>
        </div>
      ) : null}

      {!team.length ? (
        <div className={CONSOLE.stack}>
          <Callout title="No lecturer is assigned">
            Nobody can write or revise this module&rsquo;s lectures until
            somebody is - invite one below, or assign somebody already
            active on another module.
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
          value={mdl.enrolments || "-"}
          hint={isDraft ? "opens on publishing" : "since the module opened"}
        />
        <MetricCard
          label="Completed"
          value={mdl.completions || "-"}
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
                : "In the order a learner works through them. Reading only - a lecturer's own content stays theirs to write (FR-INS-060/080)."
            }
          >
            <TableFrame columns={LECTURE_COLUMNS} caption={`Lectures in ${mdl.title}`}>
              {lectures.map((mod) => (
                <Row key={mod.id}>
                  <Cell>
                    <span className="block truncate text-lg font-semibold text-ink">
                      {mod.number}. {mod.title}
                    </span>
                    {!mod.hasContent ? (
                      <span className={`block truncate ${META.base}`}>
                        No content written yet
                      </span>
                    ) : null}
                  </Cell>
                  <Cell>
                    <Badge tone={LECTURE_STATE_TONE[mod.state]}>
                      {LECTURE_STATE_LABEL[mod.state]}
                    </Badge>
                  </Cell>
                  <Cell hideBelow="md">
                    {mod.author ? (
                      <PersonTag
                        name={mod.author.name}
                        avatarUrl={mod.author.avatarUrl}
                        initials={mod.author.initials}
                        size="xs"
                      />
                    ) : (
                      <span className="text-muted-light">-</span>
                    )}
                  </Cell>
                  <Cell numeric hideBelow="xl">
                    {mod.hasContent ? attachmentsFor(mdl.id, mod.id).length : "-"}
                  </Cell>
                  <Cell hideBelow="lg">
                    {mod.hasContent ? (
                      <span className="inline-flex items-center gap-2">
                        {quizStatsFor(mod.id)
                          ? `${quizStatsFor(mod.id)?.passRate}% pass`
                          : "Not attempted"}
                        {hasBlankQuestions(mod.id) ? (
                          <Badge tone="active">+ blanks</Badge>
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
                href="/module-admin/reviews"
                className="link-wipe text-lg font-semibold text-primary"
              >
                Moderation queue
              </Link>
            }
          >
            {reviews.length ? (
              <ul className="space-y-3">
                {reviews.slice(0, 4).map((review) => {
                  const reviewer = studentById(review.studentId);
                  return (
                    <li
                      key={review.id}
                      className="rounded-sm border border-surface-deep bg-paper-raised px-5 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-lg font-semibold text-ink">
                          {reviewer ? (
                            <PersonTag
                              name={review.studentName}
                              avatarUrl={reviewer.avatarUrl}
                              initials={reviewer.initials}
                            />
                          ) : (
                            review.studentName
                          )}
                        </p>
                        <span className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <StarFilledIcon
                              key={index}
                              className={`size-4 ${
                                index < review.rating
                                  ? "text-accent"
                                  : "text-surface-deep"
                              }`}
                            />
                          ))}
                          <span className="sr-only">{review.rating} out of 5</span>
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
                  );
                })}
              </ul>
            ) : (
              <p
                className={`rounded-sm border border-dashed border-muted-light bg-paper-raised px-6 py-10 text-center ${BODY.base}`}
              >
                No reviews yet.
              </p>
            )}
          </Section>

          <Section
            title="Certificates"
            description="Issued automatically on completion of this module."
            action={
              <Link
                href="/module-admin/certificates"
                className="link-wipe text-lg font-semibold text-primary"
              >
                Full register
              </Link>
            }
          >
            <p className={BODY.base}>
              {certificates.filter((record) => record.status === "issued").length} valid,{" "}
              {certificates.filter((record) => record.status === "revoked").length}{" "}
              withdrawn, of {certificates.length} ever issued for this module.
            </p>
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
                capability="manageModuleDetails"
                fallback={<LockedNote capability="manageModuleDetails" />}
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
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl tracking-tight text-ink">
                Lecturers
              </h2>
              <div className="flex shrink-0 items-center gap-4">
                <AssignModuleLecturers
                  moduleTitle={mdl.title}
                  lecturers={lecturers()}
                  assigned={team.map((entry) => entry.id)}
                  capability="manageModuleLecturers"
                />
              </div>
            </div>
            {team.length ? (
              <ul className="mt-5 space-y-3">
                {team.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3">
                    <Avatar
                      src={entry.avatarUrl}
                      initials={entry.initials}
                      tone="light"
                      className="size-10"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-lg font-semibold text-ink">
                        {entry.name}
                      </span>
                      <span className={`block truncate ${META.base}`}>
                        {entry.title}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`mt-4 ${BODY.base}`}>Nobody yet.</p>
            )}
            <div className="mt-5 border-t border-surface-deep pt-5">
              <NewLecturerAction
                modules={[{ id: mdl.id, title: mdl.title }]}
                capability="manageModuleLecturers"
                description={`Appointed straight onto ${mdl.title} (FR-MODADM-050). Their public profile is required before the account can be created.`}
              />
            </div>
          </Panel>

          <Panel>
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl tracking-tight text-ink">
                Facts
              </h2>
              <EditModuleDetails
                moduleTitle={mdl.title}
                summary={publicEntry?.summary}
                level={mdl.level}
                hazardIds={mdl.hazardIds}
                categoryIds={mdl.categoryIds}
                capability="manageModuleDetails"
              />
            </div>
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
                {
                  term: "Hazards",
                  value: mdl.hazardIds.length
                    ? mdl.hazardIds.map(hazardLabel).join(", ")
                    : "None tagged",
                },
                {
                  term: "Categories",
                  value: mdl.categoryIds.length
                    ? mdl.categoryIds.map(categoryLabel).join(", ")
                    : "None tagged",
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
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Withdraw
            </h2>
            <p className={`mt-2 ${BODY.base}`}>
              Archiving hides a module from the catalogue permanently.
              Certificates already issued stay valid - they record what
              somebody did, and that does not stop being true.
            </p>
            <div className="mt-6">
              <IfCan
                capability="manageModuleDetails"
                fallback={<LockedNote capability="manageModuleDetails" />}
              >
                <ConfirmAction
                  label="Archive this module"
                  question={`Archive ${mdl.title}?`}
                  detail={`${mdl.enrolments || "No"} learners have enrolled. They keep their progress and their certificates; nobody new can enrol.`}
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

const LECTURE_COLUMNS: Column[] = [
  { key: "lecture", head: "Lecture" },
  { key: "state", head: "State" },
  { key: "author", head: "Author", hideBelow: "md" },
  { key: "materials", head: "Materials", numeric: true, hideBelow: "xl" },
  { key: "quiz", head: "Quiz", hideBelow: "lg" },
  { key: "updated", head: "Updated", numeric: true, hideBelow: "sm" },
];
