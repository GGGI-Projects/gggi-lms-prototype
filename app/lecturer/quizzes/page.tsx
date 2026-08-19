import type { Metadata } from "next";
import Link from "next/link";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import {
  lectureLoad,
  PASS_RATE_FLOOR,
  quizNeedsAttention,
  quizStatsFor,
  staffById,
} from "@/lib/admin";
import { PASS_MARK, QUIZ_LENGTH, hasWrittenQuestions } from "@/lib/portal";
import {
  Badge,
  Callout,
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
  Section,
  TableFrame,
  type Column,
} from "@/components/console/ui";

export const metadata: Metadata = { title: "Quizzes" };

const COLUMNS: Column[] = [
  { key: "quiz", head: "Quiz" },
  { key: "questions", head: "Questions", numeric: true, hideBelow: "sm" },
  { key: "attempts", head: "Attempts", numeric: true, hideBelow: "md" },
  { key: "pass", head: "Pass rate" },
  { key: "average", head: "Average", numeric: true, hideBelow: "sm" },
  { key: "open", head: "", numeric: true },
];

/**
 * Every quiz this lecturer is responsible for, ranked by how it is doing.
 *
 * THE WORST ONE IS AT THE TOP OF ITS MODULE. A list in lecture order is a
 * list somebody reads once; a list where the quiz that 32% of learners fail is
 * the first thing on the screen is a list that gets acted on. Lecture order is
 * still visible in the numbers, so nothing is lost.
 *
 * The pass rate is drawn as a bar because the comparison between quizzes is
 * the whole point, and eleven percentages in a column do not compare
 * themselves.
 */
export default function LecturerQuizzesPage() {
  const member = staffById(SESSION.lecturer);
  if (!member) throw new Error("[lecturer] no session account");

  const load = lectureLoad(member);
  const quizzes = load.lectures
    .filter((mod) => mod.hasContent)
    .map((mod) => ({ mod, stats: quizStatsFor(mod.id) }));

  const measured = quizzes.filter((quiz) => quiz.stats);
  const struggling = measured.filter((quiz) => quizNeedsAttention(quiz.stats));
  const attempts = measured.reduce(
    (sum, quiz) => sum + (quiz.stats?.attempts ?? 0),
    0,
  );
  const weighted = measured.reduce(
    (sum, quiz) => sum + (quiz.stats?.attempts ?? 0) * (quiz.stats?.averageScore ?? 0),
    0,
  );

  // By module, and inside each one the weakest quiz first.
  const byModule = load.modules.map((mdl) => ({
    module: mdl,
    quizzes: quizzes
      .filter((quiz) => quiz.mod.module.id === mdl.id)
      // Weakest by pass rate, because that is what the flag is drawn from.
      .sort((a, b) => (a.stats?.passRate ?? 999) - (b.stats?.passRate ?? 999)),
  }));

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/lecturer", label: "Dashboard" }}
        eyebrow="Teaching"
        title="Quizzes"
        lead={`One quiz closes each lecture: ${QUIZ_LENGTH} multiple-choice questions, plus written questions on the lectures that carry them, ${PASS_MARK}% to pass, unlimited attempts. This is where you find out which of them is working.`}
      />

      {quizzes.length ? (
        <>
          <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
            <MetricCard label="Quizzes" value={quizzes.length} hint="on your lectures" />
            <MetricCard
              label="Attempts"
              value={attempts ? attempts.toLocaleString("en-GB") : "-"}
              hint="submissions counted"
            />
            <MetricCard
              label="Average score"
              value={attempts ? `${Math.round(weighted / attempts)}%` : "-"}
              hint="across every attempt"
            />
            <MetricCard
              label="Worth a look"
              value={struggling.length}
              hint={`under ${PASS_RATE_FLOOR}% passing, or below the mark`}
              goodWhen="down"
            />
          </div>

          {struggling.length ? (
            <div className={CONSOLE.stack}>
              <Callout
                title={`${struggling.length} ${struggling.length === 1 ? "quiz is" : "quizzes are"} sending people back`}
              >
                <p>
                  {struggling
                    .map((quiz) => `${quiz.mod.number}. ${quiz.mod.title}`)
                    .join(" · ")}
                  . Fewer than {PASS_RATE_FLOOR}% pass these at the first
                  attempt, or the mean is under the pass mark. When the lectures
                  either side of one are fine, it is usually a question that is
                  ambiguous rather than material that is hard.
                </p>
              </Callout>
            </div>
          ) : null}

          <div className={`${CONSOLE.stack} space-y-12`}>
            {byModule.map(({ module: mdl, quizzes: rows }) => (
              <Section
                key={mdl.id}
                title={mdl.title}
                description={
                  rows.length
                    ? "Weakest first. Lecture order is in the numbers."
                    : "No lectures with content yet, so no quizzes."
                }
                action={
                  <Link
                    href={`/lecturer/modules/${mdl.id}`}
                    className="link-wipe text-lg font-semibold text-primary"
                  >
                    The module
                  </Link>
                }
              >
                {rows.length ? (
                  <TableFrame
                    columns={COLUMNS}
                    caption={`Quizzes in ${mdl.title}`}
                  >
                    {rows.map(({ mod, stats }) => {
                      const href = `/lecturer/modules/${mdl.id}/lectures/${mod.id}/quiz`;
                      const weak = quizNeedsAttention(stats);

                      return (
                        <Row key={mod.id} href={href}>
                          <NameCell
                            href={href}
                            title={`${mod.number}. ${mod.title}`}
                            subtitle={[
                              stats ? null : "No attempts recorded in this prototype",
                              hasWrittenQuestions(mod.id) ? "has written questions" : null,
                            ]
                              .filter(Boolean)
                              .join(" · ") || undefined}
                          />
                          <Cell numeric hideBelow="sm">
                            {QUIZ_LENGTH}
                          </Cell>
                          <Cell numeric hideBelow="md">
                            {stats ? stats.attempts.toLocaleString("en-GB") : "-"}
                          </Cell>
                          <Cell className="min-w-[11rem]">
                            {stats ? (
                              <span className="flex items-center gap-3">
                                <ProgressBar
                                  percent={stats.passRate}
                                  label={`${mod.title}: ${stats.passRate}% pass rate`}
                                  className="w-24"
                                />
                                <span className="shrink-0 tabular-nums text-sm text-muted">
                                  {stats.passRate}%
                                </span>
                                {weak ? <Badge tone="warn">Low</Badge> : null}
                              </span>
                            ) : (
                              <span className="text-muted-light">-</span>
                            )}
                          </Cell>
                          <Cell numeric hideBelow="sm">
                            {stats ? `${stats.averageScore}%` : "-"}
                          </Cell>
                          <Cell numeric>
                            <Link
                              href={href}
                              className="link-wipe text-sm font-semibold text-primary"
                            >
                              Manage
                            </Link>
                          </Cell>
                        </Row>
                      );
                    })}
                  </TableFrame>
                ) : (
                  <Panel>
                    <p className={BODY.base}>
                      This module&rsquo;s lectures are still a plan. A quiz is
                      written once a lecture has content.
                    </p>
                  </Panel>
                )}
              </Section>
            ))}
          </div>

          <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-2`}>
            <Panel>
              <h2 className="font-display text-2xl tracking-tight text-ink">
                Reading a low pass rate
              </h2>
              <p className={`mt-3 ${BODY.base}`}>
                A quiz where most people fail one particular question is a
                question that is ambiguous. A quiz where scores are low across
                all four is usually a lecture that moved too fast. The first is a
                twenty-minute fix; the second is a rewrite.
              </p>
              <p className={`mt-3 ${META.base}`}>
                Clearing past attempts after a correction is on each
                quiz&rsquo;s own page - the old scores were answering a
                different question.
              </p>
            </Panel>

            <Panel>
              <h2 className="font-display text-2xl tracking-tight text-ink">
                The rules are the platform&rsquo;s
              </h2>
              <p className={`mt-3 ${BODY.base}`}>
                {QUIZ_LENGTH} questions, {PASS_MARK}% to pass, unlimited
                attempts, no timer - the same for every quiz on the platform,
                and for the written questions attached to any of them, so a
                certificate means one thing. Only the super administrator can
                change them.
              </p>
              <PrototypeNote className="mt-5">
                Figures are carried for one module in this prototype;
                anywhere else the console says it does not know rather than
                showing a zero.
              </PrototypeNote>
            </Panel>
          </div>
        </>
      ) : (
        <div className={CONSOLE.stack}>
          <EmptyState
            title="No quizzes yet"
            body="A quiz belongs to a lecture and is written once that lecture has content. Start with a lecture."
          />
        </div>
      )}
    </PageBody>
  );
}
