import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import {
  consoleLectures,
  learnersFor,
  managedModule,
  quizStatsFor,
  staffById,
  studentById,
} from "@/lib/admin";
import { formatDate, formatDateLong, PASS_MARK } from "@/lib/portal";
import {
  Badge,
  DefinitionList,
  MetricCard,
  PageBody,
  PageHeader,
  Panel,
  ProgressBar,
  PrototypeNote,
  Section,
} from "@/components/console/ui";
import { CertificateIcon, ClockIcon } from "@/components/student-portal/icons";
import { messageContactsForLecturer } from "@/lib/comms";
import { ComposeMessageAction } from "@/components/notifications/compose-message";

type Params = { params: Promise<{ studentId: string }> };

/**
 * Only learners on this lecturer's modules exist as routes.
 *
 * The alternative - generating every learner and refusing at render - would
 * build 27 pages whose only purpose is to say no, and would leak the size of
 * the register to somebody who is not supposed to have it. A learner who is
 * not on your module is, for you, not there.
 */
export function generateStaticParams() {
  const member = staffById(SESSION.lecturer);
  if (!member) return [];
  return learnersFor(member).map((student) => ({ studentId: student.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { studentId } = await params;
  const student = studentById(studentId);
  return { title: student ? student.name : "Learner not found" };
}

/**
 * One learner, as their lecturer sees them.
 *
 * DELIBERATELY NARROWER THAN THE ADMINISTRATOR'S PAGE, and it says so at the
 * bottom rather than quietly leaving things out. What is here: progress on
 * this lecturer's own modules, lecture by lecture, how the quizzes went, and
 * a way to reach the learner directly. What is not: employer, district,
 * account status, other modules, and every administrative action.
 *
 * The line is drawn at what belongs to the ACCOUNT rather than to the
 * LEARNING. Teaching is not anonymous - a lecturer answering a question
 * should be able to see who has read what and email them about it - but
 * nothing on this page would help you suspend or profile the person, because
 * none of that is teaching.
 */
export default async function LecturerLearnerPage({ params }: Params) {
  const { studentId } = await params;
  const member = staffById(SESSION.lecturer);
  if (!member) throw new Error("[lecturer] no session account");

  const student = studentById(studentId);
  const mine = member.moduleIds ?? [];
  const relevant = student?.enrolments.filter((enrolment) =>
    mine.includes(enrolment.moduleId),
  );
  if (!student || !relevant?.length) notFound();

  const lecturesDone = relevant.reduce(
    (sum, enrolment) => sum + enrolment.lecturesDone,
    0,
  );
  const lecturesTotal = relevant.reduce((sum, enrolment) => {
    const mdl = managedModule(enrolment.moduleId);
    return sum + (mdl?.lectureCount ?? 0);
  }, 0);
  const scored = relevant.filter((enrolment) => enrolment.averageScore !== null);
  const average = scored.length
    ? Math.round(
        scored.reduce((sum, enrolment) => sum + (enrolment.averageScore ?? 0), 0) /
          scored.length,
      )
    : null;

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/lecturer/learners", label: "Enrolled students" }}
        eyebrow="Learner"
        title={student.name}
        lead={`Enrolled on ${relevant.length === 1 ? "one of your modules" : `${relevant.length} of your modules`}.`}
        meta={
          <>
            <Badge icon={<ClockIcon className="size-3.5" />}>
              Last active {formatDate(student.lastActive)}
            </Badge>
            <Badge>Joined {formatDate(student.joined)}</Badge>
            {relevant.some((enrolment) => enrolment.certificateRef) ? (
              <Badge tone="done" icon={<CertificateIcon className="size-3.5" />}>
                Finished
              </Badge>
            ) : null}
          </>
        }
        actions={
          <>
            <ComposeMessageAction
              contacts={messageContactsForLecturer(member)}
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

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Your modules"
          value={relevant.length}
          hint="they are enrolled on"
        />
        <MetricCard
          label="Lectures finished"
          value={`${lecturesDone} of ${lecturesTotal}`}
          hint="on your material"
        />
        <MetricCard
          label="Average quiz score"
          value={average === null ? "-" : `${average}%`}
          hint={average === null ? "no quiz attempted" : `${PASS_MARK}% to pass`}
        />
        <MetricCard
          label="Completed"
          value={relevant.filter((enrolment) => enrolment.certificateRef).length}
          hint="of your modules"
        />
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-10 lg:col-span-2">
          {relevant.map((enrolment) => {
            const mdl = managedModule(enrolment.moduleId);
            if (!mdl) return null;
            const lectures = consoleLectures(mdl.id);
            const percent = Math.round(
              (enrolment.lecturesDone / mdl.lectureCount) * 100,
            );

            return (
              <Section
                key={enrolment.moduleId}
                title={mdl.title}
                description={`Enrolled ${formatDateLong(enrolment.enrolledOn)}`}
                action={
                  <Link
                    href={`/lecturer/modules/${mdl.id}`}
                    className="link-wipe text-lg font-semibold text-primary"
                  >
                    The module
                  </Link>
                }
              >
                <Panel>
                  <div className="flex items-center gap-4">
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
                    {enrolment.lecturesDone} of {mdl.lectureCount} lectures
                    {enrolment.averageScore !== null
                      ? ` · quizzes averaging ${enrolment.averageScore}%`
                      : " · no quiz attempted yet"}
                  </p>

                  {/* Lecture by lecture, because "stopped at four" is the fact an
                      lecturer can act on and a percentage is not. */}
                  <ol className="mt-6 divide-y divide-surface-deep border-t border-surface-deep">
                    {lectures.map((mod, index) => {
                      const done = index < enrolment.lecturesDone;
                      const current = index === enrolment.lecturesDone;
                      const stats = quizStatsFor(mod.id);

                      return (
                        <li
                          key={mod.id}
                          className="flex items-center gap-4 py-3"
                        >
                          <span
                            aria-hidden="true"
                            className={`grid size-7 shrink-0 place-items-center rounded-full font-display text-sm font-bold tracking-tight ${
                              done
                                ? "bg-primary text-paper"
                                : current
                                  ? "bg-accent text-primary-950"
                                  : "bg-surface text-muted"
                            }`}
                          >
                            {mod.number}
                          </span>
                          <Link
                            href={`/lecturer/modules/${mdl.id}/lectures/${mod.id}`}
                            className="min-w-0 flex-1 truncate text-lg text-ink"
                          >
                            <span className="link-wipe">{mod.title}</span>
                          </Link>
                          {current ? (
                            <Badge tone="active">Here now</Badge>
                          ) : done ? (
                            <span className={META.base}>Finished</span>
                          ) : (
                            <span className={`${META.base} text-muted-light`}>
                              Not reached
                            </span>
                          )}
                          {stats && current ? (
                            <span className={`hidden shrink-0 sm:block ${META.base}`}>
                              {stats.passRate}% pass this quiz
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ol>
                </Panel>
              </Section>
            );
          })}
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              On your modules
            </h2>
            <DefinitionList
              className="mt-5"
              items={[
                { term: "Joined the platform", value: formatDateLong(student.joined) },
                { term: "Last active", value: formatDateLong(student.lastActive) },
                { term: "Lectures finished", value: `${lecturesDone} of ${lecturesTotal}` },
                {
                  term: "Average score",
                  value: average === null ? "No quiz attempted" : `${average}%`,
                },
              ]}
            />
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              What you cannot see here
            </h2>
            <p className={`mt-3 ${BODY.base}`}>
              Their employer, district and account status, any module of
              somebody else&rsquo;s they are enrolled on, and every
              administrative action. Those belong to an administrator - you
              can email this learner directly, but not act on their account.
            </p>
            <p className={`mt-3 ${META.base}`}>
              If this learner needs their account changed - a reset, a
              suspension lifted, a certificate reissued - that is a support
              request, not something to do from here.
            </p>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Reading one learner
            </h2>
            <p className={`mt-3 ${BODY.base}`}>
              One person stopping at lecture four is a person. Eleven stopping at
              lecture four is the lecture.
            </p>
            <Link
              href="/lecturer/learners"
              className="mt-4 inline-block text-lg font-semibold text-primary"
            >
              <span className="link-wipe">Everybody on your modules</span>
            </Link>
            <PrototypeNote className="mt-5" />
          </Panel>
        </aside>
      </div>
    </PageBody>
  );
}
