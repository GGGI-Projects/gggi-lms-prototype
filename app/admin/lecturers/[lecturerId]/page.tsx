import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { MANAGED_MODULES, ROLE_LABEL } from "@/content/staff";
import {
  auditEntries,
  formatNumber,
  formatStamp,
  lecturers,
  lectureLoad,
  staffById,
  staffName,
} from "@/lib/admin";
import { formatDate, formatDateLong } from "@/lib/portal";
import {
  Badge,
  Callout,
  DefinitionList,
  MetricCard,
  PageBody,
  PageHeader,
  Panel,
  PrototypeNote,
  Section,
} from "@/components/console/ui";
import { AssignModules, ConfirmAction } from "@/components/console/actions";
import { IfCan, LockedNote } from "@/components/console/permission";
import {
  LECTURE_STATE_LABEL,
  LECTURE_STATE_TONE,
  STAFF_STATUS_LABEL,
  STAFF_STATUS_TONE,
} from "@/components/console/status";
import { MailIcon } from "@/components/console/icons";

type Params = { params: Promise<{ lecturerId: string }> };

export function generateStaticParams() {
  return lecturers().map((member) => ({ lecturerId: member.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lecturerId } = await params;
  const member = staffById(lecturerId);
  return { title: member ? member.name : "Lecturer not found" };
}

/**
 * One lecturer.
 *
 * The page is built around the ASSIGNMENT, because that is the only thing on
 * it an administrator actually decides. Everything above it - lectures written,
 * learners reached, when they were last here - exists to make that decision an
 * informed one rather than a guess.
 */
export default async function LecturerPage({ params }: Params) {
  const { lecturerId } = await params;
  const member = staffById(lecturerId);
  if (!member || member.role !== "lecturer") notFound();

  const load = lectureLoad(member);
  const trail = auditEntries(member.id).slice(0, 6);
  const assigned = member.moduleIds ?? [];

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/admin/lecturers", label: "Lecturers" }}
        eyebrow={ROLE_LABEL.lecturer}
        title={member.name}
        lead={member.title}
        meta={
          <>
            <Badge tone={STAFF_STATUS_TONE[member.status]}>
              {STAFF_STATUS_LABEL[member.status]}
            </Badge>
            <Badge>Appointed {formatDate(member.createdOn)}</Badge>
            <Badge>
              {member.lastActive
                ? `Last active ${formatDate(member.lastActive)}`
                : "Has never signed in"}
            </Badge>
          </>
        }
        actions={
          <a href={`mailto:${member.email}`} className="btn-ripple btn-solid btn-sm">
            <span aria-hidden="true" className="btn-wave" />
            <span className="btn-label">
              <MailIcon className="size-4" />
              Email
            </span>
          </a>
        }
      />

      {member.status === "invited" ? (
        <div className={CONSOLE.stack}>
          <Callout title="The invitation has not been accepted">
            {member.name} was invited on {formatDateLong(member.createdOn)} and
            has not signed in. Anything assigned below waits for them until they
            do.
          </Callout>
        </div>
      ) : null}

      {!assigned.length ? (
        <div className={CONSOLE.stack}>
          <Callout tone="info" title="No modules assigned">
            Their console is empty until at least one module is ticked below.
            A lecturer can only ever author material for a module they
            have been given.
          </Callout>
        </div>
      ) : null}

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Modules" value={load.modules.length} hint="assigned" />
        <MetricCard
          label="Published lectures"
          value={load.published}
          hint="live for learners"
        />
        <MetricCard
          label="Not yet published"
          value={load.inReview + load.unwritten}
          hint={`${load.inReview} in review, ${load.unwritten} unwritten`}
        />
        <MetricCard
          label="Learners reached"
          value={load.learners ? formatNumber(load.learners) : "-"}
          hint="enrolled on their modules"
        />
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-10 lg:col-span-2">
          <Section
            title="Module assignments"
            description="What this lecturer may write. Changing it takes effect immediately and is recorded in the audit log."
          >
            <IfCan
              capability="assignModules"
              fallback={
                <div className="rounded-sm border border-surface-deep bg-paper-raised p-6">
                  <LockedNote capability="assignModules" />
                </div>
              }
            >
              <AssignModules
                lecturer={member.name.split(" ")[0]}
                assigned={assigned}
                modules={MANAGED_MODULES.map((mdl) => ({
                  id: mdl.id,
                  title: mdl.title,
                  status: mdl.status === "draft" ? "Draft" : "Published",
                  lectures: mdl.lectureCount,
                }))}
              />
            </IfCan>
          </Section>

          <Section
            title="Material"
            description="Every lecture across their assigned modules, newest edit first."
          >
            {load.lectures.length ? (
              <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
                {[...load.lectures]
                  .sort((a, b) => (b.updatedOn ?? "").localeCompare(a.updatedOn ?? ""))
                  .map((mod) => (
                    <li
                      key={`${mod.module.id}-${mod.id}`}
                      className="flex flex-wrap items-center gap-4 px-5 py-4"
                    >
                      <span className="min-w-0 flex-1">
                        <Link
                          href={`/admin/modules/${mod.module.id}/lectures/${mod.id}`}
                          className="block truncate text-lg font-semibold text-ink"
                        >
                          <span className="link-wipe">
                            {mod.number}. {mod.title}
                          </span>
                        </Link>
                        <span className={`block truncate ${META.base}`}>
                          {mod.module.title}
                          {mod.updatedOn
                            ? ` · updated ${formatDate(mod.updatedOn)}`
                            : " · never edited"}
                        </span>
                      </span>
                      <Badge tone={LECTURE_STATE_TONE[mod.state]}>
                        {LECTURE_STATE_LABEL[mod.state]}
                      </Badge>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className={`rounded-sm border border-dashed border-muted-light bg-paper-raised px-6 py-10 text-center ${BODY.base}`}>
                Nothing to write yet.
              </p>
            )}
          </Section>
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Account
            </h2>
            <DefinitionList
              className="mt-5"
              items={[
                { term: "Email", value: member.email },
                { term: "Role", value: ROLE_LABEL[member.role] },
                { term: "Appointed", value: formatDateLong(member.createdOn) },
                {
                  term: "Appointed by",
                  value: member.createdBy ? staffName(member.createdBy) : "-",
                },
                {
                  term: "Last active",
                  value: member.lastActive
                    ? formatDateLong(member.lastActive)
                    : "Never",
                },
              ]}
            />
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Their activity
            </h2>
            {trail.length ? (
              <ul className="mt-5 space-y-4">
                {trail.map((entry) => (
                  <li key={entry.id} className="border-l-2 border-surface-deep pl-4">
                    <p className="text-lg leading-snug text-ink">{entry.target}</p>
                    <p className={`mt-1 ${META.base}`}>
                      {entry.action.replace(".", " · ")} · {formatStamp(entry.at)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`mt-4 ${BODY.base}`}>
                Nothing recorded against this account yet.
              </p>
            )}
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Administration
            </h2>
            <div className="mt-6 space-y-5">
              <IfCan
                capability="manageLecturers"
                fallback={<LockedNote capability="manageLecturers" />}
              >
                {member.status === "invited" ? (
                  <ConfirmAction
                    label="Resend the invitation"
                    question={`Send ${member.name} another invitation?`}
                    detail="The previous link stops working."
                    confirmLabel="Resend it"
                    tone="neutral"
                    done="Prototype - no email was sent."
                  />
                ) : (
                  <ConfirmAction
                    label="Suspend this account"
                    question={`Suspend ${member.name}?`}
                    detail="They cannot sign in or edit anything. Lectures they have already published stay published."
                    confirmLabel="Suspend the account"
                    done="Prototype - the account is unchanged."
                  />
                )}
              </IfCan>
            </div>
            <PrototypeNote className="mt-7" />
          </Panel>
        </aside>
      </div>
    </PageBody>
  );
}
