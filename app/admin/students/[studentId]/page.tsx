import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { LEARNER } from "@/content/portal";
import {
  certificateRegister,
  managedModule,
  students,
  studentById,
  summarise,
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
  ProgressBar,
  PrototypeNote,
  Section,
} from "@/components/console/ui";
import { ConfirmAction } from "@/components/console/actions";
import { IfCan, LockedNote } from "@/components/console/permission";
import { messageContactsForAdmin } from "@/lib/comms";
import { ComposeMessageAction } from "@/components/notifications/compose-message";
import {
  CERTIFICATE_STATUS_LABEL,
  CERTIFICATE_STATUS_TONE,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/components/console/status";
import { CertificateIcon, ClockIcon } from "@/components/student-portal/icons";
import { ExternalIcon } from "@/components/console/icons";

type Params = { params: Promise<{ studentId: string }> };

export function generateStaticParams() {
  return students().map((student) => ({ studentId: student.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { studentId } = await params;
  const student = studentById(studentId);
  return { title: student ? student.name : "Student not found" };
}

/**
 * One learner's record.
 *
 * The order is the order the questions get asked in support: who is this, are
 * they getting on with it, what have they finished, and only then - what can I
 * do about it. Administrative actions are LAST and behind a confirmation,
 * because this page is read fifty times for every time it is acted on.
 *
 * What is deliberately NOT here: quiz answers, time spent per lecture, sign-in
 * history. An administrator has a legitimate reason to see progress and none
 * at all to read over somebody's shoulder, and a console that collects it
 * because it could is a console that will be asked to hand it over.
 */
export default async function StudentPage({ params }: Params) {
  const { studentId } = await params;
  const student = studentById(studentId);
  if (!student) notFound();

  const summary = summarise(student);
  const certificates = certificateRegister().filter(
    (record) => record.studentId === student.id,
  );
  const isDemoAccount = student.email === LEARNER.email;

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/admin/students", label: "Students" }}
        eyebrow="Learner record"
        title={student.name}
        lead={`${student.organisation} · ${student.district}`}
        meta={
          <>
            <Badge tone={STATUS_TONE[student.status]}>
              {STATUS_LABEL[student.status]}
            </Badge>
            <Badge>{student.sector}</Badge>
            <Badge icon={<ClockIcon className="size-3.5" />}>
              Last active {formatDate(student.lastActive)}
            </Badge>
          </>
        }
        actions={
          <>
            <ComposeMessageAction
              contacts={messageContactsForAdmin()}
              preselectedId={student.id}
              buttonLabel="Send a message"
              drawerTitle={`Message ${student.name}`}
            />
            <a
              href={`mailto:${student.email}`}
              className="btn-ripple btn-solid btn-sm"
            >
              <span aria-hidden="true" className="btn-wave" />
              <span className="btn-label">Email this learner</span>
            </a>
          </>
        }
      />

      {student.status === "suspended" ? (
        <div className={CONSOLE.stack}>
          <Callout title="This account is suspended">
            The learner cannot sign in. Their progress and any certificates
            already issued are untouched, and lifting the suspension restores
            access immediately.
          </Callout>
        </div>
      ) : null}

      {isDemoAccount ? (
        <div className={CONSOLE.stack}>
          <Callout tone="info" title="This is the demo learner">
            <p>
              The student portal signs in as this account, so the progress below
              is the same progress that dashboard shows.{" "}
              <Link href="/dashboard" className="link-wipe font-semibold text-primary">
                Open the student portal
              </Link>
              .
            </p>
          </Callout>
        </div>
      ) : null}

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Modules" value={summary.enrolled} hint="enrolled" />
        <MetricCard
          label="Lectures finished"
          value={summary.lecturesDone}
          hint={`${summary.percent}% of everything enrolled in`}
        />
        <MetricCard
          label="Average score"
          value={summary.averageScore === null ? "-" : `${summary.averageScore}%`}
          hint="across attempted quizzes"
        />
        <MetricCard
          label="Certificates"
          value={summary.completed}
          hint="modules completed"
        />
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 lg:col-span-2">
          <Section title="Enrolments" description="Every module this learner has joined.">
            {student.enrolments.length ? (
              <ul className="space-y-4">
                {student.enrolments.map((enrolment) => {
                  const mdl = managedModule(enrolment.moduleId);
                  if (!mdl) return null;
                  const percent = Math.round(
                    (enrolment.lecturesDone / mdl.lectureCount) * 100,
                  );

                  return (
                    <li
                      key={enrolment.moduleId}
                      className="rounded-sm border border-surface-deep bg-paper-raised p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            href={`/admin/modules/${mdl.id}`}
                            className="block text-lg font-semibold text-ink"
                          >
                            <span className="link-wipe">{mdl.title}</span>
                          </Link>
                          <p className={`mt-1 ${META.base}`}>
                            Enrolled {formatDateLong(enrolment.enrolledOn)}
                          </p>
                        </div>
                        {enrolment.certificateRef ? (
                          <Badge
                            tone="done"
                            icon={<CertificateIcon className="size-3.5" />}
                          >
                            Completed
                          </Badge>
                        ) : (
                          <Badge tone={percent > 0 ? "active" : "neutral"}>
                            {percent > 0 ? "In progress" : "Not started"}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-5 flex items-center gap-4">
                        <ProgressBar
                          percent={percent}
                          label={`${mdl.title}: ${percent}% complete`}
                          className="flex-1"
                        />
                        <span className="shrink-0 font-display text-lg font-bold tabular-nums tracking-tight text-ink">
                          {percent}%
                        </span>
                      </div>

                      <p className={`mt-3 ${META.base}`}>
                        {enrolment.lecturesDone} of {mdl.lectureCount}{" "}
                        lectures
                        {enrolment.averageScore !== null
                          ? ` · quizzes averaging ${enrolment.averageScore}%`
                          : " · no quiz attempted yet"}
                        {enrolment.certificateRef
                          ? ` · ${enrolment.certificateRef}`
                          : null}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-sm border border-dashed border-muted-light bg-paper-raised px-8 py-12 text-center">
                <p className={BODY.base}>
                  Registered but never enrolled in anything. This is the most
                  common shape of a dormant account, and the one an inactivity
                  email is for.
                </p>
              </div>
            )}
          </Section>

          <Section
            title="Certificates"
            className={CONSOLE.stack}
            description="Issued automatically on completion. Withdrawing one is recorded against it permanently."
          >
            {certificates.length ? (
              <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
                {certificates.map((certificate) => (
                  <li
                    key={certificate.reference}
                    className="flex flex-wrap items-center gap-4 px-5 py-4"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-semibold text-ink">
                        {certificate.moduleTitle}
                      </span>
                      <span className={`block ${META.base}`}>
                        {certificate.reference} · issued{" "}
                        {formatDate(certificate.issuedOn)}
                      </span>
                    </span>
                    <Badge tone={CERTIFICATE_STATUS_TONE[certificate.status]}>
                      {CERTIFICATE_STATUS_LABEL[certificate.status]}
                    </Badge>
                    <Link
                      href="/admin/certificates"
                      className="link-wipe text-sm font-semibold text-primary"
                    >
                      In the register
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`rounded-sm border border-dashed border-muted-light bg-paper-raised px-6 py-8 text-center ${BODY.base}`}>
                Nothing issued yet.
              </p>
            )}
          </Section>
        </div>

        {/* ------------------------------------------------------- sidebar */}
        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Account
            </h2>
            <DefinitionList
              className="mt-5"
              items={[
                { term: "Email", value: student.email },
                { term: "District", value: student.district },
                { term: "Sector", value: student.sector },
                { term: "Registered", value: formatDateLong(student.joined) },
                { term: "Last active", value: formatDateLong(student.lastActive) },
                { term: "Record id", value: <span className="tabular-nums">{student.id}</span> },
              ]}
            />
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Administration
            </h2>
            <p className={`mt-2 ${BODY.base}`}>
              Each of these is written to the audit log with your name against
              it.
            </p>

            <div className="mt-6 space-y-5">
              <IfCan
                capability="manageLearners"
                fallback={<LockedNote capability="manageLearners" />}
              >
                <ConfirmAction
                  label="Send a password reset"
                  question={`Send ${student.name} a password reset link?`}
                  detail="A single-use link, valid for one hour. Their current password keeps working until they use it."
                  confirmLabel="Send the link"
                  tone="neutral"
                  done={`Prototype - no email was sent to ${student.email}.`}
                />

                {student.status === "suspended" ? (
                  <ConfirmAction
                    label="Lift the suspension"
                    question={`Restore access for ${student.name}?`}
                    detail="They can sign in again straight away. Their progress was never removed."
                    confirmLabel="Restore access"
                    tone="neutral"
                    done="Prototype - the account is unchanged."
                  />
                ) : (
                  <ConfirmAction
                    label="Suspend this account"
                    question={`Suspend ${student.name}?`}
                    detail="They cannot sign in until an administrator lifts it. Progress and certificates already earned are kept."
                    confirmLabel="Suspend the account"
                    done="Prototype - the account is unchanged and the learner was not notified."
                  />
                )}

                <ConfirmAction
                  label="Export this record"
                  question={`Export everything held about ${student.name}?`}
                  detail="A single file containing their account, enrolments, scores and certificates - what a learner is entitled to ask for."
                  confirmLabel="Generate the export"
                  tone="info"
                  done="Prototype - no file was produced."
                />
              </IfCan>
            </div>

            <PrototypeNote className="mt-7" />
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              What this page does not show
            </h2>
            <p className={`mt-2 ${BODY.base}`}>
              Quiz answers, time spent, and sign-in history are deliberately
              absent. Progress is an administrator&rsquo;s business; reading
              over somebody&rsquo;s shoulder is not.
            </p>
            <Link
              href="/admin/settings"
              className="mt-4 inline-flex items-center gap-1.5 text-lg font-semibold text-primary"
            >
              <ExternalIcon className="size-4" />
              <span className="link-wipe">Data retention settings</span>
            </Link>
          </Panel>
        </aside>
      </div>
    </PageBody>
  );
}
