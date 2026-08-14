import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";
import {
  Badge,
  EmptyState,
  PageBody,
  PageHeader,
  StatTile,
} from "@/components/student-portal/ui";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
} from "@/components/student-portal/icons";
import {
  PASS_MARK,
  allQuizzes,
  enrolledProgress,
  type QuizSummary,
} from "@/lib/portal";
import { HEADING, META, PORTAL } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Quizzes",
  description:
    "Every module quiz in your programmes - what you have passed and what is still to take.",
};

/**
 * Every quiz, in one place.
 *
 * This screen exists for a single failure mode: finishing the modules of a
 * programme and never being told which quizzes are still standing between you
 * and its certificate. So it opens with the count that matters - quizzes to
 * take - and the rest of the page is grouped by programme rather than by
 * status, because that is how a learner will go and clear them.
 *
 * A quiz whose module is unread is still listed and still takeable. Nothing on
 * this platform is gated, and hiding a quiz until its module is ticked would
 * be a lock in everything but name.
 */
export default function QuizzesPage() {
  const programmes = enrolledProgress();
  const quizzes = allQuizzes();

  const passed = quizzes.filter((quiz) => quiz.status === "passed");
  const toTake = quizzes.filter(
    (quiz) => quiz.moduleCompleted && quiz.status !== "passed",
  );

  const average = passed.length
    ? Math.round(
      passed.reduce((sum, quiz) => sum + (quiz.score ?? 0), 0) / passed.length,
    )
    : 0;

  return (
    <PageBody>
      <PageHeader
        eyebrow="Quizzes"
        title="A short quiz closes every module."
        lead={`It confirms the ideas landed - nothing more. The pass mark is ${PASS_MARK}%, there is no limit on attempts, and the highest score is the one that counts.`}
      />

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatTile
          value={toTake.length}
          label="Quizzes to take"
          hint="Modules you have finished"
        />
        <StatTile
          value={passed.length}
          label="Quizzes passed"
          hint={`Out of ${quizzes.length} in your programmes`}
        />
        <StatTile
          value={passed.length ? `${average}%` : "-"}
          label="Average score"
          hint="Across everything passed"
        />
      </dl>

      {programmes.length ? (
        <div className={`space-y-12 ${PORTAL.stack}`}>
          {programmes.map((progress) => {
            const rows = quizzes.filter(
              (quiz) => quiz.programme.id === progress.programme.id,
            );
            const passedHere = rows.filter((row) => row.status === "passed");

            return (
              <section key={progress.programme.id}>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className={HEADING.card}>{progress.programme.title}</h2>
                    <p className={`mt-2 ${META.base}`}>
                      {passedHere.length} of {rows.length} quizzes passed
                    </p>
                  </div>
                  <Link
                    href={`/programmes/${progress.programme.id}`}
                    className="link-wipe inline-flex items-center gap-1.5 text-lg font-semibold text-primary"
                  >
                    Open programme
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </div>

                <ul className="mt-6 overflow-hidden rounded-sm border border-surface-deep bg-paper-raised divide-y divide-surface-deep">
                  {rows.map((row) => (
                    <QuizRow key={row.module.id} quiz={row} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <div className={PORTAL.stack}>
          <EmptyState
            title="No quizzes yet"
            body="Quizzes appear as soon as you enrol in a programme - one for each module, taken whenever you are ready."
            action={
              <ActionButton href="/programmes" variant="solid" size="sm">
                Browse programmes
              </ActionButton>
            }
          />
        </div>
      )}
    </PageBody>
  );
}

/**
 * One quiz.
 *
 * The status is carried by a badge AND by the wording of the link at the end
 * of the row - "Retake" against "Take the quiz" - so a learner scanning the
 * column of actions can tell the states apart without reading the badges.
 */
function QuizRow({ quiz }: { quiz: QuizSummary }) {
  const passed = quiz.status === "passed";

  return (
    <li>
      <Link
        href={quiz.href}
        className="group flex items-center gap-4 px-5 py-4 transition-colors duration-300 hover:bg-surface/60 sm:px-6"
      >
        <span
          aria-hidden="true"
          className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${passed
              ? "bg-primary text-paper"
              : quiz.status === "failed"
                ? "bg-clay-pale text-clay"
                : "border border-surface-deep bg-paper text-muted"
            }`}
        >
          {passed ? <CheckIcon className="size-4" /> : quiz.module.number}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink">
            {quiz.module.title}
          </span>
          <span className={`mt-0.5 block ${META.base}`}>
            {passed
              ? `Passed with ${quiz.score}%`
              : quiz.status === "failed"
                ? `Last attempt ${quiz.score}% - below the ${PASS_MARK}% pass mark`
                : quiz.moduleCompleted
                  ? "Module finished - quiz not taken"
                  : "Available whenever you are ready"}
          </span>
        </span>

        <span className="hidden shrink-0 sm:block">
          {passed ? (
            <Badge tone="done">Passed</Badge>
          ) : quiz.status === "failed" ? (
            <Badge tone="warn">Retake</Badge>
          ) : quiz.moduleCompleted ? (
            <Badge tone="active">To take</Badge>
          ) : (
            <Badge>Not yet</Badge>
          )}
        </span>

        <ChevronRightIcon className="size-5 shrink-0 text-muted-light transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-ink" />
      </Link>
    </li>
  );
}
