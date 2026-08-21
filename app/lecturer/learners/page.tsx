import type { Metadata } from "next";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import {
  formatNumber,
  learnersFor,
  managedModule,
  lectureLoad,
  staffById,
} from "@/lib/admin";
import { formatDate } from "@/lib/portal";
import {
  Badge,
  Cell,
  EmptyState,
  MetricCard,
  NameCell,
  PageBody,
  PageHeader,
  Panel,
  ProgressBar,
  PrototypeNote,
  Row,
  type Column,
} from "@/components/console/ui";
import { Register, type RegisterItem } from "@/components/console/register";

export const metadata: Metadata = { title: "Learners" };

const COLUMNS: Column[] = [
  { key: "learner", head: "Learner" },
  { key: "module", head: "Module" },
  { key: "progress", head: "Progress" },
  { key: "score", head: "Avg. score", numeric: true, hideBelow: "sm" },
  { key: "active", head: "Last active", numeric: true, hideBelow: "md" },
];

/**
 * How learners are getting on with this lecturer's material.
 *
 * DELIBERATELY LESS THAN THE ADMIN REGISTER, and the page says so rather than
 * quietly omitting columns. No email address, no district, no organisation, no
 * account status, no administrative actions - a lecturer needs to know that
 * eleven people are stuck on lecture four, and has no business knowing where
 * any of them works.
 *
 * Names are kept because teaching is not anonymous: a lecturer answering a
 * question in a forum should be able to see who has done what. The line is
 * drawn at what belongs to the account rather than at what belongs to the
 * learning.
 */
export default function LecturerLearnersPage() {
  const member = staffById(SESSION.lecturer);
  if (!member) throw new Error("[lecturer] no session account");

  const load = lectureLoad(member);
  const mine = (member.moduleIds ?? []).filter(
    (id) => managedModule(id)?.status === "published",
  );
  const learners = learnersFor(member);

  // One row per learner per module of this lecturer's: the same person on
  // two of their modules is two different pieces of progress, and merging
  // them into an average would hide both.
  const rows = learners.flatMap((student) =>
    student.enrolments
      .filter((enrolment) => mine.includes(enrolment.moduleId))
      .map((enrolment) => ({ student, enrolment })),
  );

  const items: RegisterItem[] = rows.map(({ student, enrolment }) => {
    const mdl = managedModule(enrolment.moduleId);
    const percent = mdl
      ? Math.round((enrolment.lecturesDone / mdl.lectureCount) * 100)
      : 0;
    const state =
      percent === 100 ? "finished" : percent === 0 ? "not-started" : "in-progress";

    return {
      id: `${student.id}-${enrolment.moduleId}`,
      text: [student.name, mdl?.title].join(" ").toLowerCase(),
      tags: [state, enrolment.moduleId],
      row: (
        <Row href={`/lecturer/learners/${student.id}`}>
          <NameCell
            href={`/lecturer/learners/${student.id}`}
            initials={student.initials}
            avatarUrl={student.avatarUrl}
            title={student.name}
          />
          <Cell>{mdl?.title}</Cell>
          <Cell className="min-w-[12rem]">
            <span className="flex items-center gap-3">
              <ProgressBar
                percent={percent}
                label={`${student.name}: ${percent}% complete`}
                className="w-24"
              />
              <span className="shrink-0 tabular-nums text-sm text-muted">
                {enrolment.lecturesDone}/{mdl?.lectureCount}
              </span>
              {enrolment.certificateRef ? (
                <Badge tone="done">Finished</Badge>
              ) : null}
            </span>
          </Cell>
          <Cell numeric hideBelow="sm">
            {enrolment.averageScore === null ? (
              <span className="text-muted-light">not attempted</span>
            ) : (
              `${enrolment.averageScore}%`
            )}
          </Cell>
          <Cell numeric hideBelow="md">
            {formatDate(student.lastActive)}
          </Cell>
        </Row>
      ),
    };
  });

  const finished = rows.filter(({ student, enrolment }) => {
    void student;
    return Boolean(enrolment.certificateRef);
  }).length;

  return (
    <PageBody>
      <PageHeader
        eyebrow="Teaching"
        title="Learners"
        lead="Everybody enrolled on a module you write for, and how far they have got. Nothing here is about their account - see the note below."
      />

      {load.modules.length ? (
        <>
          <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
            <MetricCard
              label="Enrolled"
              value={formatNumber(load.learners)}
              hint="across your modules"
            />
            <MetricCard
              label="In this sample"
              value={rows.length}
              hint="records the prototype ships"
            />
            <MetricCard label="Finished" value={finished} hint="earned a certificate" />
            <MetricCard
              label="Never started"
              value={rows.filter(({ enrolment }) => enrolment.lecturesDone === 0).length}
              hint="enrolled but not opened"
              goodWhen="down"
            />
          </div>

          <div className={CONSOLE.stack}>
            <Register
              columns={COLUMNS}
              caption="Learners on your modules"
              items={items}
              searchPlaceholder="Search by name or module"
              filters={[
                { value: "all", label: "All", count: rows.length },
                {
                  value: "in-progress",
                  label: "In progress",
                  count: items.filter((item) => item.tags.includes("in-progress"))
                    .length,
                },
                {
                  value: "finished",
                  label: "Finished",
                  count: items.filter((item) => item.tags.includes("finished"))
                    .length,
                },
                {
                  value: "not-started",
                  label: "Never started",
                  count: items.filter((item) => item.tags.includes("not-started"))
                    .length,
                },
              ]}
              selectFilter={
                mine.length > 1
                  ? {
                      label: "Module",
                      placeholder: "Every module",
                      options: mine.map((id) => ({
                        value: id,
                        label: managedModule(id)?.title ?? id,
                      })),
                    }
                  : undefined
              }
              emptyMessage="No learner matches that."
            />
          </div>
        </>
      ) : (
        <div className={CONSOLE.stack}>
          <EmptyState
            title="No modules, no learners"
            body="Once an administrator assigns you a module, everybody enrolled on it appears here."
          />
        </div>
      )}

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-2`}>
        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            What this screen does not show you
          </h2>
          <p className={`mt-3 ${BODY.base}`}>
            Email addresses, employers, districts, account status, and any way
            to act on an account. Those belong to an administrator. You can see
            that eleven people stopped at lecture four - which is a fact about
            your material - and not where any of them works.
          </p>
          <p className={`mt-3 ${META.base}`}>
            Names are kept, because teaching is not anonymous.
          </p>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Reading it
          </h2>
          <p className={`mt-3 ${BODY.base}`}>
            A cluster of learners stalling at the same lecture is usually the
            lecture, not the learners. A quiz average below 70% on one lecture and
            above 90% either side is a question that is wrong, not a cohort that
            is weak.
          </p>
          <PrototypeNote className="mt-5" />
        </Panel>
      </div>
    </PageBody>
  );
}
