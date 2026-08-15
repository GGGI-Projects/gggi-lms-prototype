import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { MANAGED_PROGRAMMES, ROLE_LABEL } from "@/content/staff";
import {
  auditEntries,
  formatNumber,
  formatStamp,
  instructors,
  moduleLoad,
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
import { AssignProgrammes, ConfirmAction } from "@/components/console/actions";
import { IfCan, LockedNote } from "@/components/console/permission";
import {
  MODULE_STATE_LABEL,
  MODULE_STATE_TONE,
  STAFF_STATUS_LABEL,
  STAFF_STATUS_TONE,
} from "@/components/console/status";
import { MailIcon } from "@/components/console/icons";

type Params = { params: Promise<{ instructorId: string }> };

export function generateStaticParams() {
  return instructors().map((member) => ({ instructorId: member.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { instructorId } = await params;
  const member = staffById(instructorId);
  return { title: member ? member.name : "Instructor not found" };
}

/**
 * One instructor.
 *
 * The page is built around the ASSIGNMENT, because that is the only thing on
 * it an administrator actually decides. Everything above it - modules written,
 * learners reached, when they were last here - exists to make that decision an
 * informed one rather than a guess.
 */
export default async function InstructorPage({ params }: Params) {
  const { instructorId } = await params;
  const member = staffById(instructorId);
  if (!member || member.role !== "instructor") notFound();

  const load = moduleLoad(member);
  const trail = auditEntries(member.id).slice(0, 6);
  const assigned = member.programmeIds ?? [];

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/admin/instructors", label: "Instructors" }}
        eyebrow={ROLE_LABEL.instructor}
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
          <Callout tone="info" title="No programmes assigned">
            Their console is empty until at least one programme is ticked below.
            An instructor can only ever author material for a programme they
            have been given.
          </Callout>
        </div>
      ) : null}

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Programmes" value={load.programmes.length} hint="assigned" />
        <MetricCard
          label="Published modules"
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
          hint="enrolled on their programmes"
        />
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-10 lg:col-span-2">
          <Section
            title="Programme assignments"
            description="What this instructor may write. Changing it takes effect immediately and is recorded in the audit log."
          >
            <IfCan
              capability="assignProgrammes"
              fallback={
                <div className="rounded-sm border border-surface-deep bg-paper-raised p-6">
                  <LockedNote capability="assignProgrammes" />
                </div>
              }
            >
              <AssignProgrammes
                instructor={member.name.split(" ")[0]}
                assigned={assigned}
                programmes={MANAGED_PROGRAMMES.map((programme) => ({
                  id: programme.id,
                  title: programme.title,
                  status: programme.status === "draft" ? "Draft" : "Published",
                  modules: programme.moduleCount,
                }))}
              />
            </IfCan>
          </Section>

          <Section
            title="Material"
            description="Every module across their assigned programmes, newest edit first."
          >
            {load.modules.length ? (
              <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
                {[...load.modules]
                  .sort((a, b) => (b.updatedOn ?? "").localeCompare(a.updatedOn ?? ""))
                  .map((mod) => (
                    <li
                      key={`${mod.programme.id}-${mod.id}`}
                      className="flex flex-wrap items-center gap-4 px-5 py-4"
                    >
                      <span className="min-w-0 flex-1">
                        <Link
                          href={`/admin/programmes/${mod.programme.id}/modules/${mod.id}`}
                          className="block truncate text-lg font-semibold text-ink"
                        >
                          <span className="link-wipe">
                            {mod.number}. {mod.title}
                          </span>
                        </Link>
                        <span className={`block truncate ${META.base}`}>
                          {mod.programme.title}
                          {mod.updatedOn
                            ? ` · updated ${formatDate(mod.updatedOn)}`
                            : " · never edited"}
                        </span>
                      </span>
                      <Badge tone={MODULE_STATE_TONE[mod.state]}>
                        {MODULE_STATE_LABEL[mod.state]}
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
                capability="manageInstructors"
                fallback={<LockedNote capability="manageInstructors" />}
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
                    detail="They cannot sign in or edit anything. Modules they have already published stay published."
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
