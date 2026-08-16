import Link from "next/link";
import { BODY, CONSOLE, META } from "@/lib/theme";
import type { Question } from "@/content/portal";
import type { QuizStats } from "@/content/operations";
import { PASS_RATE_FLOOR, quizNeedsAttention, type ConsoleModule } from "@/lib/admin";
import {
  Badge,
  Callout,
  DefinitionList,
  MetricCard,
  Panel,
  Section,
} from "@/components/console/ui";
import { ConfirmAction } from "@/components/console/actions";
import {
  AddQuestionAction,
  EditQuestionAction,
  RemoveQuestionAction,
} from "@/components/console/add-question-action";
import { IfCan, LockedNote } from "@/components/console/permission";
import { ExternalIcon } from "@/components/console/icons";

/**
 * One module's quiz, as the person responsible for it sees it.
 *
 * ITS OWN SCREEN rather than a section of the module page, because a quiz is
 * four questions with four options and an explanation each - twenty-four
 * pieces of writing - and material that has to be scrolled past to reach the
 * publish button is material that goes unrevised for a year.
 *
 * THE ANSWER AND THE EXPLANATION ARE SHOWN TOGETHER, which is the one thing
 * this screen must get right. A question is wrong far more often than a cohort
 * is weak, and the way to see that is to read the correct answer beside the
 * sentence that justifies it. Where the platform has results, they sit at the
 * top - a pass rate below the mark is the reason somebody opened this page.
 *
 * The pass mark is deliberately not editable here. It is one number for the
 * whole platform, set in platform settings by the super administrator; a quiz
 * that could set its own would make a certificate mean something different per
 * module.
 */
export function QuizManager({
  programme,
  mod,
  questions,
  stats,
  passMark,
  hrefs,
  capability,
}: {
  programme: { id: string; title: string; status: string };
  mod: ConsoleModule;
  questions: Question[];
  stats: QuizStats | null;
  passMark: number;
  hrefs: {
    module: string;
    programme: string;
    /** Where a learner takes it. Absent when the module is not published. */
    learner?: string;
    /** Platform settings, where the pass mark lives. */
    settings?: string;
  };
  capability: "manageProgrammes" | "authorModules";
}) {
  const struggling = quizNeedsAttention(stats);

  return (
    <div className={CONSOLE.stack}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Questions"
          value={questions.length}
          hint={`${passMark}% to pass`}
        />
        <MetricCard
          label="Attempts"
          value={stats ? stats.attempts : "-"}
          hint={stats ? "learners who submitted" : "no figures in this prototype"}
        />
        <MetricCard
          label="Pass rate"
          value={stats ? `${stats.passRate}%` : "-"}
          hint={stats ? "reached the pass mark" : "no figures yet"}
        />
        <MetricCard
          label="Average score"
          value={stats ? `${stats.averageScore}%` : "-"}
          hint={stats ? "across every attempt" : "no figures yet"}
          goodWhen="up"
        />
      </div>

      {struggling && stats ? (
        <div className="mt-4">
          <Callout title="This quiz is sending people back">
            {stats.passRate}% pass it - under the {PASS_RATE_FLOOR}% this
            console treats as healthy - averaging {stats.averageScore}% across{" "}
            {stats.attempts} attempts. Before rewriting the module, read the
            four questions below: when the modules either side of one are fine,
            the problem is usually a question that is ambiguous rather than
            material that is hard.
          </Callout>
        </div>
      ) : null}

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 lg:col-span-2">
          <Section
            title="Questions"
            description="The correct answer and its explanation are shown together - the explanation is what a learner reads after submitting, whether they got it right or not."
          >
            {questions.length ? (
              <ol className="space-y-4">
                {questions.map((question, index) => (
                  <li
                    key={question.id}
                    className="rounded-sm border border-surface-deep bg-paper-raised p-6"
                  >
                    <p className="text-lg font-semibold leading-snug text-ink">
                      {index + 1}. {question.prompt}
                    </p>

                    <ul className="mt-4 space-y-1.5">
                      {question.options.map((option, optionIndex) => {
                        const correct = optionIndex === question.answer;
                        return (
                          <li
                            key={option}
                            className={`flex items-start gap-3 rounded-sm px-4 py-2 text-lg ${
                              correct
                                ? "bg-tint-mist font-medium text-ink"
                                : "text-muted"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`mt-2 size-1.5 shrink-0 rounded-full ${
                                correct ? "bg-primary" : "bg-muted-light"
                              }`}
                            />
                            <span className="flex-1">{option}</span>
                            {correct ? (
                              <span className="shrink-0 text-sm font-semibold text-primary">
                                Correct
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>

                    <p
                      className={`mt-4 border-t border-surface-deep pt-3 ${META.base}`}
                    >
                      {question.explanation}
                    </p>

                    {/* A row of its own, not tucked beside the prompt - see the
                        note on `<RemoveContentBlockAction>` in `module-editor.tsx`:
                        `<RemoveQuestionAction>` can expand into a full
                        confirmation panel, which needs somewhere safe to grow. */}
                    <IfCan capability={capability}>
                      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-surface-deep pt-4">
                        <EditQuestionAction
                          question={question}
                          number={index + 1}
                          capability={capability}
                        />
                        <RemoveQuestionAction
                          number={index + 1}
                          capability={capability}
                        />
                      </div>
                    </IfCan>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={`rounded-sm border border-dashed border-muted-light bg-paper-raised px-6 py-12 text-center ${BODY.base}`}>
                No quiz has been written for this module yet. A quiz is written
                once the module has content.
              </p>
            )}

            <div className="mt-4">
              <AddQuestionAction
                capability={capability}
                nextNumber={questions.length + 1}
              />
            </div>
          </Section>
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              This quiz
            </h2>
            <DefinitionList
              className="mt-5"
              items={[
                {
                  term: "Module",
                  value: (
                    <Link href={hrefs.module} className="link-wipe text-primary">
                      {mod.number}. {mod.title}
                    </Link>
                  ),
                },
                {
                  term: "Programme",
                  value: (
                    <Link href={hrefs.programme} className="link-wipe text-primary">
                      {programme.title}
                    </Link>
                  ),
                },
                { term: "Questions", value: questions.length },
                { term: "Pass mark", value: `${passMark}%` },
                { term: "Attempts allowed", value: "Unlimited" },
                { term: "Time limit", value: "None" },
              ]}
            />

            {hrefs.learner ? (
              <Link
                href={hrefs.learner}
                className="mt-5 inline-flex items-center gap-1.5 text-lg font-semibold text-primary"
              >
                <ExternalIcon className="size-4" />
                <span className="link-wipe">Take it as a learner does</span>
              </Link>
            ) : null}
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              The rules are not set here
            </h2>
            <p className={`mt-3 ${BODY.base}`}>
              Pass mark, attempt limit and time limit are one set of rules for
              every quiz on the platform. A quiz that could set its own would
              make a certificate mean something different depending on which
              module it came through.
            </p>
            {hrefs.settings ? (
              <Link
                href={hrefs.settings}
                className="mt-4 inline-block text-lg font-semibold text-primary"
              >
                <span className="link-wipe">Platform settings</span>
              </Link>
            ) : (
              <p className={`mt-3 ${META.base}`}>
                An administrator changes them in platform settings.
              </p>
            )}
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Reset results
            </h2>
            <p className={`mt-3 ${BODY.base}`}>
              After a question has been corrected, past attempts were answering
              a different question. Clearing them removes the scores but never a
              certificate already issued.
            </p>
            <div className="mt-6">
              <IfCan
                capability={capability}
                fallback={<LockedNote capability={capability} />}
              >
                <ConfirmAction
                  label="Clear past attempts"
                  question={`Clear every attempt at the module ${mod.number} quiz?`}
                  detail={
                    stats
                      ? `${stats.attempts} attempts would be removed. Learners who had passed keep their module completion and any certificate already issued.`
                      : "There are no recorded attempts in this prototype."
                  }
                  confirmLabel="Clear the attempts"
                  done="Prototype - nothing was cleared."
                />
              </IfCan>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

/** The chip row above a quiz screen, shared by both consoles' headers. */
export function QuizHeaderMeta({
  questions,
  passMark,
  stats,
}: {
  questions: number;
  passMark: number;
  stats: QuizStats | null;
}) {
  return (
    <>
      <Badge>{questions} questions</Badge>
      <Badge>Pass mark {passMark}%</Badge>
      {stats ? (
        <Badge tone={stats.averageScore < passMark ? "warn" : "done"}>
          {stats.passRate}% passing
        </Badge>
      ) : (
        <Badge tone="neutral">No results recorded</Badge>
      )}
    </>
  );
}
